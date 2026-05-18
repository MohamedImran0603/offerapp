# Offer Lanka - Mobile Application

Welcome to the **Offer Lanka** mobile app! This is the primary customer-facing application where users can discover the best supermarket deals, discounts, and brand offers across Sri Lanka.

## 🛠 Tech Stack

- **Framework**: React Native + Expo (Managed Workflow)
- **Routing**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native) / StyleSheet
- **State Management**: TanStack Query + Zustand (Planned)
- **Localization**: `i18next` (English, Sinhala, Tamil)

## 🚀 Running the App

### 1. Web Preview (Fastest way to test)

To view the application directly in your web browser (simulating mobile view):

```bash
npx expo start --web
```

*Note: If you experience network fetch errors on Windows, run `npx expo start --web --offline`.*

### 2. Android Emulator

Make sure you have Android Studio installed and an AVD (Android Virtual Device) running.

```bash
npx expo start --android
```

### 3. Physical Device (Expo Go)

Download the **Expo Go** app on your iOS or Android device. Run:

```bash
npx expo start
```

Scan the QR code that appears in your terminal with your phone's camera (iOS) or the Expo Go app (Android).

## 📁 Project Structure

- `app/index.tsx`: The Welcome/Splash screen.
- `app/(tabs)/home.tsx`: The main Home feed displaying active offers.
- `app/(tabs)/search.tsx`: The Search interface with category filtering.
- `app/offer/[id].tsx`: The dynamic Offer Details screen.
- `src/components/`: Reusable UI components like Buttons and Cards.
- `src/lib/`: Mock data, Firebase initialization, and Notifications logic.

---
*For backend and admin panel documentation, please refer to the `README.md` in the root directory of the monorepo.*
