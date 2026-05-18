import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder translations
const resources = {
  en: {
    translation: {
      "Welcome": "Welcome to Offer Lanka",
      "Search": "Search offers, brands...",
      "Home": "Home",
      "Favorites": "Favorites",
      "Profile": "Profile"
    }
  },
  si: {
    translation: {
      "Welcome": "ඔෆර් ලංකා වෙත සාදරයෙන් පිළිගනිමු",
      "Search": "දීමනා සොයන්න...",
      "Home": "ප්‍රධාන පිටුව",
      "Favorites": "කැමති දේවල්",
      "Profile": "පැතිකඩ"
    }
  },
  ta: {
    translation: {
      "Welcome": "ஆஃபர் லங்காவுக்கு வருக",
      "Search": "சலுகைகளைத் தேடுங்கள்...",
      "Home": "முகப்பு",
      "Favorites": "பிடித்தவை",
      "Profile": "சுயவிவரம்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
