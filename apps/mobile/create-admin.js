const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDmgymampmasnX1o6T1DjQnSffLw4JYFL8",
  authDomain: "offer-lanka.firebaseapp.com",
  projectId: "offer-lanka",
  storageBucket: "offer-lanka.firebasestorage.app",
  messagingSenderId: "302490070938",
  appId: "1:302490070938:web:8a7a1c439acb8faa7dd423"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = "admin@offerlanka.com";
  const password = "password123";

  try {
    console.log("Attempting to provision admin@offerlanka.com in Firebase...");
    
    let uid = "";
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
      console.log(`✅ Auth user created successfully! UID: ${uid}`);
    } catch (authError) {
      if (authError.code === "auth/email-already-in-use") {
        console.log("ℹ️ Auth account already exists. Logging in to retrieve UID...");
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = loginCredential.user.uid;
      } else {
        throw authError;
      }
    }

    console.log("Provisioning Firestore permissions...");
    await setDoc(doc(db, "admins", uid), {
      name: "Super Admin",
      email: email,
      role: "super_admin",
      districts: ["All"],
      permissions: [
        "offers.create",
        "offers.edit",
        "offers.delete",
        "offers.approve",
        "users.manage",
        "analytics.view",
        "notifications.send"
      ],
      mfaEnabled: false,
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    console.log("🚀 SUCCESS! You can now log in using: admin@offerlanka.com / password123");
  } catch (error) {
    console.error("❌ Failed to provision admin account:", error);
  }
}

createAdmin();
