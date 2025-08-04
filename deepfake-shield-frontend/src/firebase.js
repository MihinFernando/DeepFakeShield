// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ✅ Paste your config below
const firebaseConfig = {
  apiKey: "AIzaSyCzgWtX8IAy1WIKNbpu9zAYMuylnG1i-6w",
  authDomain: "deepfakeshield-604c7.firebaseapp.com",
  projectId: "deepfakeshield-604c7",
  appId:  "1:1052171112902:web:1e5331d89930637b1862c7"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🧩 Export Authentication tools
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
