import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Real Firebase credentials for Offer Lanka
const firebaseConfig = {
  apiKey: "AIzaSyDmgymampmasnX1o6T1DjQnSffLw4JYFL8",
  authDomain: "offer-lanka.firebaseapp.com",
  projectId: "offer-lanka",
  storageBucket: "offer-lanka.firebasestorage.app",
  messagingSenderId: "302490070938",
  appId: "1:302490070938:web:8a7a1c439acb8faa7dd423"
};

// Prevent re-initializing on hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
