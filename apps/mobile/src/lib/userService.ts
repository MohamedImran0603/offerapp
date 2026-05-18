import { db } from './firebase';
import {
  doc, setDoc, deleteDoc, getDoc, updateDoc,
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Get the currently logged-in user's ID from local storage
// ============================================================
const STORAGE_KEY = 'offer_lanka_user_id';

export const saveUserIdLocally = async (userId: string) => {
  await AsyncStorage.setItem(STORAGE_KEY, userId);
};

export const getLocalUserId = async (): Promise<string> => {
  const id = await AsyncStorage.getItem(STORAGE_KEY);
  return id || 'GUEST_USER';
};

// ============================================================
// USER PROFILE — Save & Get user details
// ============================================================
export const saveUserProfile = async (userData: {
  name: string;
  email: string;
  phone: string;
  district: string;
  language: string;
}) => {
  const userId = userData.phone.replace(/\+/g, '').replace(/ /g, '');
  
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    isVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Save user ID locally for future sessions
  await saveUserIdLocally(userId);
  return userId;
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<{
  name: string;
  district: string;
  language: string;
}>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ============================================================
// FAVORITES — Save & Remove favorite offers
// ============================================================
export const toggleFavorite = async (offerId: string, offerData: any) => {
  const userId = await getLocalUserId();
  const favRef = doc(db, 'users', userId, 'favorites', offerId);
  const snap = await getDoc(favRef);

  if (snap.exists()) {
    await deleteDoc(favRef);
    return false; // Removed from favorites
  } else {
    await setDoc(favRef, {
      ...offerData,
      savedAt: serverTimestamp(),
    });
    return true; // Added to favorites
  }
};

export const subscribeToFavorites = (callback: (favs: any[]) => void) => {
  // Use a local listener that gracefully handles missing userId
  let userId = 'GUEST_USER';
  
  AsyncStorage.getItem(STORAGE_KEY).then(id => {
    userId = id || 'GUEST_USER';
  });

  const q = query(collection(db, 'users', userId, 'favorites'));
  return onSnapshot(q, (snapshot) => {
    const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(favs);
  }, () => callback([])); // Return empty on error
};

// ============================================================
// SHOPPING LIST — Add, toggle, delete items
// ============================================================
export const addToShoppingList = async (item: { title: string; price: number }) => {
  const userId = await getLocalUserId();
  const listRef = collection(db, 'users', userId, 'shoppingList');
  await addDoc(listRef, {
    ...item,
    checked: false,
    createdAt: serverTimestamp(),
  });
};

export const toggleShoppingItem = async (itemId: string, currentStatus: boolean) => {
  const userId = await getLocalUserId();
  const itemRef = doc(db, 'users', userId, 'shoppingList', itemId);
  await updateDoc(itemRef, { checked: !currentStatus });
};

export const deleteShoppingItem = async (itemId: string) => {
  const userId = await getLocalUserId();
  const itemRef = doc(db, 'users', userId, 'shoppingList', itemId);
  await deleteDoc(itemRef);
};

export const subscribeToShoppingList = (callback: (items: any[]) => void) => {
  let userId = 'GUEST_USER';

  AsyncStorage.getItem(STORAGE_KEY).then(id => {
    userId = id || 'GUEST_USER';
  });

  const q = query(
    collection(db, 'users', userId, 'shoppingList'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, () => callback([]));
};

// ============================================================
// SEARCH HISTORY — Track user searches
// ============================================================
export const saveSearchHistory = async (searchTerm: string) => {
  const userId = await getLocalUserId();
  const historyRef = collection(db, 'users', userId, 'searchHistory');
  await addDoc(historyRef, {
    term: searchTerm,
    searchedAt: serverTimestamp(),
  });
};

// ============================================================
// OFFERS — Save offers (admin use)
// ============================================================
export const saveOffer = async (offerData: {
  title: string;
  store: string;
  category: string;
  district: string;
  image: string;
  newPrice: number;
  oldPrice: number;
  discountPercent: number;
}) => {
  const offersRef = collection(db, 'offers');
  const docRef = await addDoc(offersRef, {
    ...offerData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });
  return docRef.id;
};
