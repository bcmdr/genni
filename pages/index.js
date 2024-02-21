// pages/index.js
import { useState } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [currentCode, setCurrentCode] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("/.netlify/functions/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.reply);
      setCurrentCode(data.reply);
      setError(null);
    } catch (error) {
      console.error("Error calling OpenAI function:", error);
      setError(error.message || "An error occurred.");
    }
  };

  return (
    <div>
      <div>
        <label>
          <input
            style={{ width: "calc(100% - 100px)", padding: "0.5rem" }}
            type="text"
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>
        <button
          style={{ width: "100px", padding: "0.5rem" }}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      {error && (
        <div style={{ color: "red" }}>
          <p>Error: {error}</p>
        </div>
      )}
      <CodeEditor code={currentCode} />
      <iframe
        id="result-iframe"
        sandbox="allow-scripts"
        frameborder="0"
        width="100%"
        height="100%"
        srcdoc={currentCode}
      ></iframe>
    </div>
  );
};

export default Home;
