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

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

/**
 * Register a new user with unique username and email.
 * Throws if username already exists.
 */
export const registerUser = async (name: string, email: string, password: string) => {
  // Ensure username uniqueness in Firestore
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("name", "==", name));
  const snap = await getDocs(q);
  if (!snap.empty) {
    throw new Error("Username already taken");
  }
  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  // Store user profile
  await setDoc(doc(db, "users", uid), { name, email, createdAt: new Date().toISOString() });
  return userCredential;
};

/**
 * Sign in an existing user.
 */
export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export { app, auth, db, storage };
