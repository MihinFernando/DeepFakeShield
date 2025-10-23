import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzgWtX8IAy1WIKNbpu9zAYMuylnG1i-6w",
  authDomain: "deepfakeshield-604c7.firebaseapp.com",
  projectId: "deepfakeshield-604c7",
  storageBucket: "deepfakeshield-604c7.firebasestorage.app",
  messagingSenderId: "1052171112902",
  appId: "1:1052171112902:web:4f92ee6074e9f8451862c7",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app };
