# 🔥 Firebase Setup Guide — Offer Lanka

## Step 1 — Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Enter name: `offer-lanka`
4. Click **Continue** → **Continue** → **Create project**

---

## Step 2 — Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose region: **asia-south1 (Mumbai)** ← closest to Sri Lanka
5. Click **"Enable"**

---

## Step 3 — Get Your Config Keys

1. Click the **⚙️ gear icon** → **Project Settings**
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → Choose **`</>`** (Web)
4. Enter app name: `offer-lanka-web`
5. Click **"Register app"**
6. You will see a config block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "offer-lanka-xxxxx.firebaseapp.com",
  projectId: "offer-lanka-xxxxx",
  storageBucket: "offer-lanka-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## Step 4 — Update Your .env File

Open this file:
```
C:\Users\DELL\Desktop\OfferApp\apps\mobile\.env
```

Replace the placeholder values with your REAL values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXX...your real key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=offer-lanka-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=offer-lanka-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=offer-lanka-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## Step 5 — Deploy Firestore Rules

In VS Code terminal, run:
```powershell
cd C:\Users\DELL\Desktop\OfferApp
npx firebase-tools deploy --only firestore:rules
```

---

## Step 6 — Restart the App

Stop the server (Ctrl+C) then restart:
```powershell
cd C:\Users\DELL\Desktop\OfferApp\apps\mobile
npx expo start --web
```

---

## ✅ What Gets Saved to Firebase

| Data | Firestore Path | When Saved |
|------|---------------|------------|
| User Profile | `users/{phone}` | On registration |
| Favorites | `users/{phone}/favorites/{offerId}` | On heart tap |
| Shopping List | `users/{phone}/shoppingList/{itemId}` | On "Add to list" |
| Search History | `users/{phone}/searchHistory/{id}` | On search |
| Offers | `offers/{offerId}` | On seed/admin |

---

## 🔍 View Your Data in Firebase

1. Go to **https://console.firebase.google.com**
2. Select your project
3. Click **"Firestore Database"** in the sidebar
4. You will see all collections and documents in real time!
