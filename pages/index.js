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
    `<div style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif"><h1>Bring Ideas<br />to Life<br />by Prototyping<br />in Seconds.</h1><p style="padding: 1rem; text-align: right">The future is now.</marquee></p></div>`,
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
        console.log(error);
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
      setCurrentRender( `<div style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif"><h1>Hmm...<br />That didn't work.</h1><p style="padding: 1rem; text-align: right">Please try again.</marquee></p></div>`);
      setLoading(false);
    }
  };

  return (
    <main className=".main">
      <header className={styles.header}>
        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <input
            className={styles.input}
            type="text"
            placeholder="Type Here to Describe Your Idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className={styles.button}
            type="submit"
          >
            Generate
          </button>
        </form>
        {loading && (
          <progress
            className={styles.progress}
          ></progress>
        )}
      </header>
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
        sandbox="allow-scripts allow-modals"
        frameBorder="0"
        width="100%"
        srcDoc={currentRender}
      ></iframe>
    </main>
  );
};

export default Home;
