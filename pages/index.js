// pages/index.js
import { useState } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentRender, setCurrentRender] = useState(
    `<section 
    style="
      height: calc(100vh - 5rem); 
      display: flex; 
      flex-direction: column; margin: 2rem;
      justify-content: space-between; 
      font-family: sans-serif
    "
  >
  <h1>Bring Ideas<br />to Life<br />by Prototyping<br />in Seconds.</h1>
  <p style="
    padding: 1rem; 
    text-align: right
  ">
    A few tries should do the trick.
  </p>
</section>`,
  );
  const [currentCode, setCurrentCode] = useState(currentRender);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUsage, setCurrentUsage] = useState({});
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [user, setUser] = useState(null)

  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleSave = async (e) => {
    e.preventDefault();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();
    if (loading) return;
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
      setCurrentResult(data.reply);
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
        <section className={styles.generate}> 
          <form
            action="#"
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <input
              className={styles.input}
              type="text"
              placeholder="Describe Your Idea..."
              value={prompt}
              enterkeyhint="go"
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div style={{display: "flex", padding: "0.5rem", gap: "1rem"}}>
            <input
              disabled={loading}
              className={styles.submit}
              type="submit"
              value={ !loading ? "Generate" : "Generating..."}
            /> 
            </div>
          </form>
          <section className={styles.navigation}>{user ? <div className={styles.user}>bcmdr</div> : <div className={styles.login}>Login</div>}</section>
        </section>
      </header>
      <main className={styles.main}>
      <iframe
        className={styles.resultFrame}
        sandbox="allow-scripts allow-modals
        allow-forms"
        srcDoc={currentRender}
      ></iframe>
      {revealed && (
        <CodeEditor className={styles.codeEditor} code={currentCode} onEditorChange={handleEditorChange} />
      )}
      </main>
      <footer className={styles.footer}><section style={{display: "flex", gap: "0.5rem"}}><div className={styles.brand}><strong>Genni</strong></div>
   {!showTerms ? <div style={{cursor: "pointer"}} onClick={() => setShowTerms(true)}>Terms</div> :  <div style={{cursor: "pointer"}} onClick={() => setShowTerms(false)}>Copyright © 2024 Brett Commandeur.<br />Generated content is owned by the user.</div> }</section>
          {loading && (
          <div className={styles.loading}>
            <progress
              className={styles.progress}
            ></progress>
          </div>
        )}
          <section style={{margin: 0, display: "flex", gap: "0.5rem", alignItems: "center"}}>
            {currentRender &&
              <div onClick={() => setRevealed(!revealed)}>{!revealed ? `Show Code` : ' Hide Code'}</div> 
            }                          <button className={styles.copy} onClick={() => {navigator.clipboard.writeText(currentRender); setCopied(true); setTimeout(()=> setCopied(false), 1000)}}>{!copied ? `Copy` : `Copied`}
            </button>{currentResult && 
            <button className={styles.save} onClick={handleSave}>Save</button>}</section>

        </footer>
    </>
  );
};

export default Home;
