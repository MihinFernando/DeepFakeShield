import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import {
  auth,
  googleProvider,
  facebookProvider,
} from "./firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchHistory(firebaseUser);
      } else {
        setHistory([]);
        setResult(null);
      }
    });
    return unsubscribe;
  }, []);

  const signInGoogle = () => signInWithPopup(auth, googleProvider);
  const signInFacebook = () => signInWithPopup(auth, facebookProvider);
  const signOutUser = () => signOut(auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return alert("Select a file and login first");

    setLoading(true);
    const idToken = await user.getIdToken();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setResult(res.data);
      fetchHistory(user);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const fetchHistory = async (firebaseUser) => {
    if (!firebaseUser) return;

    const idToken = await firebaseUser.getIdToken();

    try {
      const res = await axios.post(
        "http://localhost:5000/history",
        { userId: firebaseUser.uid },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.card}>
        <h1 className={styles.header}>Deepfake Image Detector</h1>

        {!user ? (
          <>
            <button className={styles.button} onClick={signInGoogle}>
              Sign in with Google
            </button>
            <button className={styles.button} onClick={signInFacebook}>
              Sign in with Facebook
            </button>
          </>
        ) : (
          <>
            <div className={styles.topBar}>
              <button className={styles.signOutButton} onClick={signOutUser}>
                Sign Out
              </button>
            </div>

            <input
              className={styles.inputFile}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected preview"
                className={styles.imagePreview}
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />
            )}

            <button
              className={styles.button}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Detecting..." : "Upload & Detect"}
            </button>

            {result && (
              <div className={styles.result}>
                <p>
                  <strong>Label:</strong> {result.label} <br />
                  <strong>Confidence:</strong>{" "}
                  {(result.confidence * 100).toFixed(2)}%
                </p>
              </div>
            )}

            <div className={styles.historyList}>
              <h3>Your Detection History</h3>
              {history.length === 0 && <p>No history yet.</p>}
              {history.map((item, i) => (
                <div key={i} className={styles.historyItem}>
                  <div title={item.filename}>{item.filename || "Unknown"}</div>
                  <div>{item.label}</div>
                  <div>{(item.confidence * 100).toFixed(2)}%</div>
                  <div>{item.timestamp}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
