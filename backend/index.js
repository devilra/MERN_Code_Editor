const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const languageMap = {
  javascript: 63,
  python: 71,
  c: 50,
  cpp: 54,
  java: 62,
};

app.post("/run", async (req, res) => {
  const { code, language } = req.body;

  const language_id = languageMap[language];

  if (!code || !language_id) {
    return res
      .status(400)
      .json({ error: "Code or language_id is missing/invalid" });
  }

  try {
    // 🔁 Submit code to Judge0
    const submissionRes = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        source_code: code,
        language_id: language_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    const token = submissionRes.data.token;

    // 🔁 Poll every 1s until result.status.id != 1 or 2 (In Queue/Processing)
    let result;
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      const resultRes = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      result = resultRes.data;

      if (result.status.id !== 1 && result.status.id !== 2) {
        break; // ✅ Result ready
      }

      // ⏱️ Wait 1 second before next check
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries++;
    }

    // 🎯 Send back the result
    const { stdout, stderr, status } = result;
    res.json({ stdout, stderr, status: status.description });
  } catch (error) {
    console.error("❌ Judge0 Error:", error.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
