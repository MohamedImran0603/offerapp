import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Web sign‑in using Firebase popup
export async function signInWithGoogleWeb(): Promise<void> {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    // User is now signed in; auth state listener will handle navigation
  } catch (error) {
    console.error('Google Web sign‑in error:', error);
    throw error;
  }
}
