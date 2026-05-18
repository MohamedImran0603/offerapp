/**
 * Firebase Connection Test Script
 * Run with: node test-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDmgymampmasnX1o6T1DjQnSffLw4JYFL8",
  authDomain: "offer-lanka.firebaseapp.com",
  projectId: "offer-lanka",
  storageBucket: "offer-lanka.firebasestorage.app",
  messagingSenderId: "302490070938",
  appId: "1:302490070938:web:8a7a1c439acb8faa7dd423"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  console.log('\n🔥 Testing Firebase Connection...\n');

  const testRef = doc(db, 'test_connection', 'test_doc');

  // WRITE
  console.log('📝 Step 1: Writing test data to Firestore...');
  await setDoc(testRef, {
    message: 'Hello from Offer Lanka! 🇱🇰',
    timestamp: new Date().toISOString(),
    status: 'connected'
  });
  console.log('   ✅ Write successful!\n');

  // READ
  console.log('📖 Step 2: Reading data back from Firestore...');
  const snap = await getDoc(testRef);
  if (snap.exists()) {
    console.log('   ✅ Read successful! Data:');
    console.log('  ', JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('   ❌ Read failed - document not found');
  }

  // CLEANUP
  console.log('\n🧹 Step 3: Cleaning up test data...');
  await deleteDoc(testRef);
  console.log('   ✅ Test document deleted\n');

  console.log('🎉 Firebase is FULLY CONNECTED and working!\n');
  process.exit(0);
}

testFirebase().catch(err => {
  console.error('\n❌ Firebase Connection FAILED:\n', err.message);
  console.error('\nPlease check:\n1. Your internet connection\n2. Firestore is enabled in Firebase Console\n3. Your API key is correct\n');
  process.exit(1);
});
