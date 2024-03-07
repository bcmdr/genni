// pages/index.js
import { useState, useRef, useEffect } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";
import { supabase } from '../utils/supabase'

const Home = () => {

  // State

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const baseRender =
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
</section>`;
  const [currentRender, setCurrentRender] = useState(
    baseRender
  );
  const [currentCode, setCurrentCode] = useState(currentRender);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentUsage, setCurrentUsage] = useState({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [user, setUser] = useState(null);
  const promptInput = useRef(null);
  const [savedPages,setSavedPages] = useState(null);
  const [session, setSession] = useState(null)

  // Effects

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (!session) return;
    console.log(session);
    let ignore = false;
    async function getProfile() {
      setLoadingProfile(true)
      const { user } = session;

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
  }, [session]); 

  // Handlers

  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if ( currentResult && !window.confirm(
      "Logging in will clear your current results. Your next results can be saved to your account after logging in. To copy your current results, select Cancel, then Show Code."
    )) return;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) {
      console.log(error.error_description || error.message)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault();
    if (saved) return alert("Already saved. To unsave it, please delete this from your collection.");
    if (!session?.user) return;

    setSaving(true);
    const pageData = { prompt, code: currentRender };
    const { error } = await supabase.from('pages').insert(pageData);
    if (!error) {
      setSavedPages([...savedPages, pageData]);
      setSaved(true);
    } else {
      setSaved(false);
    }
    setSaving(false);
  }

  const handleDelete = async (id) => {
    console.log(id);
    if (!window.confirm("You sure? Deleting is permanent.")) return;  
    if (!session?.user) return;
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
    if (!error) {
      setSavedPages(savedPages.filter((page) => { return page.id != id } ));
    } else {
      console.error(error);
    }
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
      loadPage(prompt, data.reply);
      setSaved(false);
      setCurrentUsage(data.usage);
      setError(null);

    } catch (error) {
      console.error("Error calling OpenAI function:", error);
      setCurrentRender( `<div style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif"><h1>Hmm...<br />That didn't work.</h1><p style="padding: 1rem; text-align: right">Please try again.</p></div>`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (prompt, code) => {
    loadPage(prompt, code);
    setSaved(true);
  }

  const handleLogout = (event) => {
    if (currentResult && !window.confirm("Logging out will clear your current result.")) return;
    supabase.auth.signOut();
    unloadPage();
    setSavedPages(null);
  }

  // Functions

  const loadPage = (prompt, code) => {
    setPrompt(prompt);
    setCurrentRender(code);
    setCurrentResult(code);
    setCurrentCode(code);
  }

  const unloadPage = () => {
    setPrompt(null);
    setCurrentRender(baseRender); 
    setCurrentCode(null); 
    setCurrentResult(null)
    setSaved(false);
  }

  // const isSaved = () => {
  //   for (page of savedPages) {
  //     if (page.code == currentResult.code 
  //   }
  // }

  // components

  const PromptIcon = () => {
    return <div className={styles.promptIcon} onClick={() => {promptInput.current.focus()}}>&gt;</div>
  }
  
  const PagePreviews = ({pages}) => {
    return (
      <section className={styles.pagePreviewContainer}>
      <h2>Saved Ideas</h2>
        <div className={styles.pagePreviewList}>
          {pages.map((page, index) => {return page && 
            <div 
              className={styles.pagePreview}
              key={index}>
                <span style={{cursor: "pointer"}} onClick={() => handlePageSelect(page.prompt, page.code)}>{page.prompt}</span>
                <span onClick={() => handleDelete(page.id)} className={styles.delete}>&times;</span>
            </div>
        })}
        </div>
      </section>
    )
  }

  return (
    <>
      <header className={styles.header}>
        <section className={styles.generate}> 
          <form
            action="#"
            className={styles.form}
            onSubmit={handleSubmit}
          ><PromptIcon />
            <input
              ref={promptInput}
              className={styles.input}
              type="text"
              placeholder="Describe Your Idea..."
              value={prompt || ""}
              enterKeyHint="go"
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
        { 
          (savedPages?.length > 0 && !currentResult)
            ? <PagePreviews pages={savedPages} /> 
            : <>
                <iframe
                  className={styles.resultFrame}
                  sandbox="allow-scripts allow-modals
                  allow-forms allow-popups"
                  srcDoc={currentRender}
                ></iframe>
                {revealed && (
                  <CodeEditor className={styles.codeEditor} code={currentCode} onEditorChange={handleEditorChange} />
                )}
              </>
          }
      </main>
      <footer className={styles.footer}>
        <section className={styles.navigation}> 
          {!showTerms ? 
          <>
            <div className={styles.brand}>
              <a href="/">Genni</a>
            </div>
            <div onClick={() => setShowTerms(true)}>Terms</div>
            {session ? <><div onClick={() => handleLogout()}>Logout</div><div onClick={() => {unloadPage()}}className={styles.user}>Collection</div> </>: <div onClick={handleLogin} className={styles.login}>Login</div>}
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
          {(currentResult && !error) &&
            <section className={styles.options}>
              <div onClick={() => setRevealed(!revealed)}>{!revealed ? `Show Code` : ' Hide Code'}</div> 
              {revealed && 
                <button className={styles.copy} 
                  onClick={() => {
                    navigator.clipboard.writeText(currentRender);
                    setCopied(true); 
                    setTimeout(()=> setCopied(false), 1000)}}>
                      {!copied ? `Copy` : `Copied`}
                </button>
              }
              { session?.user && 
              <button className={!saved ? styles.save : styles.saved} onClick={handleSave}>{saving ? '...' : !saved ? `Save` : `Saved`}</button>}
            </section>
          }
        </footer>
    </>
  );
};

export default Home;
