// pages/index.js
import { useState, useRef, useEffect } from "react";
import CodeEditor from "@components/CodeEditor";
import styles from "./index.module.css";
import {
  auth,
  db,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "../utils/firebase";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const baseRender = `<section 
     style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif">
     <h1>Bring Ideas to Life</h1><p style="padding: 1rem; text-align: right">A few tries should do the trick.</p></section>`;
  const [currentRender, setCurrentRender] = useState(baseRender);
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
  const [savedPages, setSavedPages] = useState(null);
  const [session, setSession] = useState(null);

  // Effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession(user);
      } else {
        setSession(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let ignore = false;

    async function getProfile() {
      setLoadingProfile(true);
      const q = query(
        collection(db, "pages"),
        where("created_by", "==", session.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (!ignore) {
        setSavedPages(data);
      }
      setLoadingProfile(false);
    }

    getProfile();
    return () => {
      ignore = true;
    };
  }, [session]);

  // Handlers
  const handleEditorChange = (code) => {
    setCurrentCode(code);
    setCurrentRender(code);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saved) return alert("Already saved.");
    if (!session) return;

    setSaving(true);
    const pageData = { prompt, code: currentRender, created_by: session.uid };
    try {
      await addDoc(collection(db, "pages"), pageData);
      setSavedPages([...savedPages, pageData]);
      setSaved(true);
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("You sure? Deleting is permanent.")) return;
    try {
      await deleteDoc(doc(db, "pages", id));
      setSavedPages(savedPages.filter((page) => page.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSavedPages(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      loadPage(prompt, data.reply);
      setSaved(false);
      setCurrentUsage(data.usage);
      setError(null);
    } catch (error) {
      console.error("Error calling the function:", error);
      setCurrentRender(
        `<div style="height: calc(100vh - 5rem); display: flex; flex-direction: column; margin: 2rem; justify-content: space-between; font-family: sans-serif"><h1>Hmm...<br />That didn't work.</h1><p style="padding: 1rem; text-align: right">Please try again.</p></div>`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPage = (prompt, code) => {
    setPrompt(prompt);
    setCurrentRender(code);
    setCurrentResult(code);
    setCurrentCode(code);
  };

  const unloadPage = () => {
    setPrompt(null);
    setCurrentRender(baseRender);
    setCurrentCode(null);
    setCurrentResult(null);
    setSaved(false);
  };

  return (
    <>
      <header className={styles.header}>
        <section className={styles.generate}>
          <form action="#" className={styles.form} onSubmit={handleSubmit}>
            {/* <PromptIcon /> */}
            <input
              ref={promptInput}
              className={styles.input}
              type="text"
              placeholder="Click here to describe your idea..."
              value={prompt || ""}
              enterKeyHint="go"
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              disabled={loading}
              className={styles.submit}
              type="submit"
              value={!loading ? "Generate" : "Generating..."}
            />
          </form>
        </section>
      </header>
      <main className={styles.main}>
        {savedPages?.length > 0 && !currentResult ? (
          <PagePreviews pages={savedPages} />
        ) : (
          <>
            <iframe
              className={styles.resultFrame}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              allow="
              clipboard-read;
              clipboard-write;
              camera;
              microphone;
              geolocation;
              fullscreen;
              accelerometer;
              gyroscope;
              magnetometer;
              encrypted-media;
              picture-in-picture;
              usb;
              xr-spatial-tracking;
              wake-lock;
              vr
            "
              srcDoc={currentRender}
            ></iframe>
            {revealed && (
              <CodeEditor
                className={styles.codeEditor}
                code={currentCode}
                onEditorChange={handleEditorChange}
              />
            )}
          </>
        )}
      </main>
      <footer className={styles.footer}>
        <section className={styles.navigation}>
          {!showTerms ? (
            <>
              <div className={styles.brand}>
                <a href="/">Genni</a>
              </div>
              <div onClick={() => setShowTerms(true)}>Terms</div>
              {session ? (
                <>
                  <div onClick={() => handleLogout()}>Logout</div>
                  <div
                    onClick={() => {
                      unloadPage();
                    }}
                    className={styles.user}
                  >
                    Collection
                  </div>
                </>
              ) : (
                <div onClick={handleLogin} className={styles.login}>
                  Login
                </div>
              )}
            </>
          ) : (
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setShowTerms(false)}
            >
              Copyright © 2024 Brett Commandeur.
              <br />
              Generated content is owned by the user.
            </div>
          )}
        </section>
        {loading && (
          <div className={styles.loading}>
            <progress className={styles.progress}></progress>
          </div>
        )}
        {currentResult && !error && (
          <section className={styles.options}>
            <div onClick={() => setRevealed(!revealed)}>
              {!revealed ? `Show Code` : " Hide Code"}
            </div>
            {revealed && (
              <button
                className={styles.copy}
                onClick={() => {
                  navigator.clipboard.writeText(currentRender);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }}
              >
                {!copied ? `Copy` : `Copied`}
              </button>
            )}
            {session?.user && (
              <button
                className={!saved ? styles.save : styles.saved}
                onClick={handleSave}
              >
                {saving ? "..." : !saved ? `Save` : `Saved`}
              </button>
            )}
          </section>
        )}
      </footer>
    </>
  );
};

export default Home;
