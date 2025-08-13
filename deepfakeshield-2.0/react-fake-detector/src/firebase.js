// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzgWtX8IAy1WIKNbpu9zAYMuylnG1i-6w",
  authDomain: "deepfakeshield-604c7.firebaseapp.com",
  projectId: "deepfakeshield-604c7",
  storageBucket: "deepfakeshield-604c7.firebasestorage.app",
  messagingSenderId: "1052171112902",
  appId: "1:1052171112902:web:1e5331d89930637b1862c7"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
