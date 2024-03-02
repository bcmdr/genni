// pages/index.js
import { useState, useRef, useEffect } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";
import { supabase } from '../utils/supabase'

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
      flex-direction: column; 
      margin: 2rem;
      justify-content: space-between; 
      font-family: sans-serif
    "
  >
  <h1>Bring Ideas
    <br />to Life
    <br />by Prototyping
    <br />in Seconds.
  </h1>
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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentUsage, setCurrentUsage] = useState({});
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [user, setUser] = useState(null);
  const promptInput = useRef(null);
  const [savedPages,setSavedPages] = useState([]);

  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      if (!session) return;
      setLoadingProfile(true)
      const user = session;

      const { data, error } = await supabase
        .from('pages')
        .select()
        .eq('created_by', user.id)

      if (!ignore) {
        if (error) {
          console.warn(error)
        } else if (data) {
          console.log(data);
          setSavedPages(data);
        }
      }

      setLoadingProfile(false)
    }

    getProfile()
    return () => {
      ignore = true
    }
  }), [session]

  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if ( currentResult && !window.confirm(
      "Logging in will clear your current results. Your next results can be saved to your account after logging in. To copy your current results, select Cancel, then Show Code."
    )) return;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })

    if (error) {
      console.log(error.error_description || error.message)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault();
    if (!session?.user) return;
    const { error } = await supabase.from('pages').insert({ prompt, code: currentRender })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      promptInput.current.focus(); 
      return; 
    }
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
              ref={promptInput}
              className={styles.input}
              type="text"
              placeholder="Describe Your Idea..."
              value={prompt}
              enterkeyhint="go"
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              disabled={loading}
              className={styles.submit}
              type="submit"
              value={ !loading ? "Generate" : "Generating..."}
            /> 
          </form>
        </section>
      </header>
      <main className={styles.main}>
        { (session?.user && !currentRender ) ? <div>{console.log()}</div> : <>
      <iframe
        className={styles.resultFrame}
        sandbox="allow-scripts allow-modals
        allow-forms"
        srcDoc={currentRender}
      ></iframe>
      {revealed && (
        <CodeEditor className={styles.codeEditor} code={currentCode} onEditorChange={handleEditorChange} />
      )}</>}
      </main>
      <footer className={styles.footer}>
        <section className={styles.navigation}> 
          {!showTerms ? 
          <>
            <div className={styles.brand}>
              <a href="/">Genni</a>
            </div>
            <div onClick={() => setShowTerms(true)}>Terms</div>
            {session ? <><div className={styles.user}>Profile</div><div onClick={() => supabase.auth.signOut()}>Logout</div> </>: <div onClick={handleLogin} className={styles.login}>Login</div>}
            </> : <div style={{cursor: "pointer"}} onClick={() => setShowTerms(false)}>Copyright © 2024 Brett Commandeur.<br />Generated content is owned by the user.</div>
          }
        </section>
          {loading && (
            <div className={styles.loading}>
              <progress
                className={styles.progress}
              ></progress>
            </div>
          )}
          <section className={styles.options}>
            {currentRender &&
              <div onClick={() => setRevealed(!revealed)}>{!revealed ? `Show Code` : ' Hide Code'}</div> 
            }                          
            {revealed && <button className={styles.copy} onClick={() => {navigator.clipboard.writeText(currentRender); setCopied(true); setTimeout(()=> setCopied(false), 1000)}}>{!copied ? `Copy` : `Copied`}
            </button>}{currentResult && session?.user && 
            <button className={styles.save} onClick={handleSave}>Save</button>}</section>

        </footer>
    </>
  );
};

export default Home;
