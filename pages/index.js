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
  const [currentUsage, setCurrentUsage] = useState({});

  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleSubmit = async (e) => {
    if (loading) return;
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
      setCurrentUsage(data.usage)
      setError(null);
    } catch (error) {
      console.error("Error calling OpenAI function:", error);
      setCurrentRender( `<div style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif"><h1>Hmm...<br />That didn't work.</h1><p style="padding: 1rem; text-align: right">Please try again.</p></div>`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <form
          action="#"
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <textarea
            className={styles.textarea}
            type="text"
            placeholder="Type Here to Describe Your Idea..."
            value={prompt}
            enterkeyhint="Generate"
            onChange={(e) => setPrompt(e.target.value)}
          />
          <input
            disabled={loading}
            className={styles.submit}
            type="submit"
            value={ !loading ? "Generate" : "Loading"}
          />  
        </form>
      </header>
      <main className={styles.main}>
      {revealed && (
        <CodeEditor code={currentCode} onEditorChange={handleEditorChange} />
      )}
      <iframe
        className={styles.resultFrame}
        sandbox="allow-scripts allow-modals
        allow-forms"
        srcDoc={currentRender}
      ></iframe>
      </main>
      <footer className={styles.options}>
          {loading && (
          <div className={styles.loading}>
            <progress
              className={styles.progress}
            ></progress>
          </div>
        )}
          <p style={{margin: 0}}>{currentUsage.total_tokens || 0 } <strong>tkns</strong></p>
        </footer>
    </>
  );
};

export default Home;
