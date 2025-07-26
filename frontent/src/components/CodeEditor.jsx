import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { api } from "../api";

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  //console.log(language);

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");

    try {
      const response = await api.post("/run", {
        code,
        language,
      });

      const { stdout, stderr, status } = response.data;

      if (stderr) {
        setOutput(stderr);
      } else if (stdout) {
        setOutput(stdout);
      } else {
        setOutput(`No Output | Status: ${status}`);
      }
    } catch (error) {
      setOutput("Error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isCodeEmpty = !code || code.trim() === "";
  console.log(isCodeEmpty);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">
        🧠 Online Code Editor
      </h2>
      <div className="w-full max-w-5xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="text-sm font-semibold">Select Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="border border-gray-700 rounded-md overflow-hidden shadow-lg">
          <Editor
            height="400px"
            language={language}
            defaultValue={code}
            theme="vs-dark"
            onChange={(value) => setCode(value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleRun}
            disabled={isCodeEmpty || loading}
            className={`px-6 py-2 rounded-md font-semibold transition-all duration-500 ${
              isCodeEmpty || loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}>
            ▶️ Run Code
          </button>
        </div>
        {/* Output */}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">🔍 Output:</h3>
          <div className="bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap border border-gray-700">
            {loading ? "loading..." : output}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
