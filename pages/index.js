// pages/index.js
import { useState } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [currentCode, setCurrentCode] = useState("");
  const [currentRender, setCurrentRender] = useState(
    `<div style="margin: 2rem; font-family: sans-serif"><h1>Bring Your Ideas to Life<br />by Prototyping in Seconds.</h1><p style="position: fixed; bottom: 0; right: 2rem;">The future is now.</marquee></p></div>`,
  );
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setCurrentRender(data.reply);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error calling OpenAI function:", error);
      setError(error.message || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <form
          style={{ display: "flex", backgroundColor: "black" }}
          onSubmit={handleSubmit}
        >
          <input
            className={styles.input}
            type="text"
            placeholder="Type Here to Describe Your App..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className={styles.button}
            style={{ width: "100px", padding: "0.5rem" }}
            onClick={handleSubmit}
          >
            Generate
          </button>
        </form>
      </div>
      <div style={{ display: "flex", margin: "0.25rem" }}>
        {loading && (
          <progress
            style={{ flexGrow: 1 }}
            className={styles.progress}
          ></progress>
        )}
      </div>
      <div style={{ margin: "0rem 2rem" }}>
        {error && (
          <div style={{ color: "red" }}>
            <p>Error: {error}</p>
          </div>
        )}
        {revealed && (
          <CodeEditor code={currentCode} onEditorChange={handleEditorChange} />
        )}
      </div>
      <iframe
        id="result-iframe"
        sandbox="allow-scripts"
        frameborder="0"
        width="100%"
        height="100%"
        srcdoc={currentRender}
      ></iframe>
    </div>
  );
};

export default Home;
