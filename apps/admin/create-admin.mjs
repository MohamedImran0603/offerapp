import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDmgymampmasnX1o6T1DjQnSffLw4JYFL8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "offer-lanka.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "offer-lanka",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "offer-lanka.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "302490070938",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:302490070938:web:8a7a1c439acb8faa7dd423"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@offerlanka.com", "Admin123!");
    console.log("✅ Admin user created successfully:", userCredential.user.email);
    console.log("Email: admin@offerlanka.com");
    console.log("Password: Admin123!");
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("✅ Admin user (admin@offerlanka.com) already exists. Ready to login!");
      process.exit(0);
    } else {
      console.error("❌ Error creating admin user:", error.message);
      process.exit(1);
    }
  }
}

createAdmin();
