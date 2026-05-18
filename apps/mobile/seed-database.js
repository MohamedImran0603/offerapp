/**
 * Offer Lanka — Real Database Seeder
 * Adds real offers, categories, and stores to Firebase
 * Run with: node seed-database.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore');

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

// ─── REAL OFFERS DATA ─────────────────────────────────────────────────────────
const offers = [
  // ELECTRONICS
  {
    title: 'Samsung Galaxy A55 5G',
    store: 'Softlogic',
    category: 'Electronics',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format',
    newPrice: 89900,
    oldPrice: 109900,
    discountPercent: 18,
    brand: 'Samsung',
    daysLeft: 7,
    pages: 12,
    isActive: true,
  },
  {
    title: 'Apple iPhone 15 128GB',
    store: 'Abans',
    category: 'Electronics',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format',
    newPrice: 225000,
    oldPrice: 249000,
    discountPercent: 10,
    brand: 'Apple',
    daysLeft: 5,
    pages: 8,
    isActive: true,
  },
  {
    title: 'LG 55" 4K Smart TV',
    store: 'Singer',
    category: 'Electronics',
    district: 'Kandy',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&auto=format',
    newPrice: 149900,
    oldPrice: 179900,
    discountPercent: 17,
    brand: 'LG',
    daysLeft: 10,
    pages: 16,
    isActive: true,
  },
  {
    title: 'Sony WH-1000XM5 Headphones',
    store: 'Damro',
    category: 'Electronics',
    district: 'Gampaha',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format',
    newPrice: 54900,
    oldPrice: 69900,
    discountPercent: 21,
    brand: 'Sony',
    daysLeft: 3,
    pages: 6,
    isActive: true,
  },

  // FOOD & GROCERY
  {
    title: 'Basmati Rice 5kg Premium',
    store: 'Keells',
    category: 'Food - Grocery',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&auto=format',
    newPrice: 1250,
    oldPrice: 1550,
    discountPercent: 19,
    brand: 'Keells',
    daysLeft: 4,
    pages: 24,
    isActive: true,
  },
  {
    title: 'Anchor Full Cream Milk Powder 400g',
    store: 'Cargills',
    category: 'Dairy & Eggs',
    district: 'Gampaha',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format',
    newPrice: 820,
    oldPrice: 990,
    discountPercent: 17,
    brand: 'Anchor',
    daysLeft: 6,
    pages: 20,
    isActive: true,
  },
  {
    title: 'Fresh Chicken Breast 1kg',
    store: 'Arpico',
    category: 'Chicken, Meat & Fish',
    district: 'Kandy',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d11b60?w=800&auto=format',
    newPrice: 1100,
    oldPrice: 1350,
    discountPercent: 19,
    brand: 'Arpico',
    daysLeft: 2,
    pages: 18,
    isActive: true,
  },
  {
    title: 'Coca-Cola 1.5L x 6 Pack',
    store: 'Glomark',
    category: 'Drinks & Beverages',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1561758033-7e924f619b47?w=800&auto=format',
    newPrice: 750,
    oldPrice: 900,
    discountPercent: 17,
    brand: 'Coca-Cola',
    daysLeft: 5,
    pages: 14,
    isActive: true,
  },
  {
    title: 'Dettol Soap 3 Pack Special',
    store: 'Keells',
    category: 'Health & Beauty',
    district: 'Galle',
    image: 'https://images.unsplash.com/photo-1584897649874-63e4e7bcc7ef?w=800&auto=format',
    newPrice: 320,
    oldPrice: 420,
    discountPercent: 24,
    brand: 'Dettol',
    daysLeft: 8,
    pages: 10,
    isActive: true,
  },
  {
    title: 'Pampers Baby Dry Diapers L 50pcs',
    store: 'Cargills',
    category: 'Baby & Mom Care',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format',
    newPrice: 2850,
    oldPrice: 3500,
    discountPercent: 19,
    brand: 'Pampers',
    daysLeft: 6,
    pages: 16,
    isActive: true,
  },
  {
    title: 'Surf Excel Washing Powder 2kg',
    store: 'Arpico',
    category: 'Laundry & Cleaning',
    district: 'Kurunegala',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
    newPrice: 680,
    oldPrice: 850,
    discountPercent: 20,
    brand: 'Surf Excel',
    daysLeft: 9,
    pages: 8,
    isActive: true,
  },
  {
    title: 'Comfort Fabric Conditioner 1L',
    store: 'Glomark',
    category: 'Laundry & Cleaning',
    district: 'Matara',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format',
    newPrice: 450,
    oldPrice: 560,
    discountPercent: 20,
    brand: 'Comfort',
    daysLeft: 7,
    pages: 12,
    isActive: true,
  },

  // HOME & LIFESTYLE
  {
    title: 'Damro 3-Seater Sofa Set',
    store: 'Damro',
    category: 'Home & Lifestyle',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format',
    newPrice: 45900,
    oldPrice: 59900,
    discountPercent: 23,
    brand: 'Damro',
    daysLeft: 14,
    pages: 28,
    isActive: true,
  },
  {
    title: 'Arpico Dining Table 6 Chairs',
    store: 'Arpico',
    category: 'Home & Lifestyle',
    district: 'Kandy',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format',
    newPrice: 38500,
    oldPrice: 48000,
    discountPercent: 20,
    brand: 'Arpico',
    daysLeft: 11,
    pages: 22,
    isActive: true,
  },

  // CLOTHING
  {
    title: 'Odel Summer Collection 2025',
    store: 'Odel',
    category: 'Clothing & Apparels',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format',
    newPrice: 1990,
    oldPrice: 2990,
    discountPercent: 33,
    brand: 'Odel',
    daysLeft: 12,
    pages: 36,
    isActive: true,
  },
  {
    title: 'Nike Running Shoes Air Max',
    store: 'Softlogic',
    category: 'Clothing & Apparels',
    district: 'Colombo',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format',
    newPrice: 14900,
    oldPrice: 18500,
    discountPercent: 19,
    brand: 'Nike',
    daysLeft: 8,
    pages: 14,
    isActive: true,
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('\n🌱 Seeding Offer Lanka Database...\n');
  console.log(`📦 Adding ${offers.length} real offers...\n`);

  let count = 0;

  for (const offer of offers) {
    const offerRef = doc(collection(db, 'offers'));
    await setDoc(offerRef, {
      ...offer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    count++;
    console.log(`   ✅ (${count}/${offers.length}) ${offer.store} — ${offer.title}`);
  }

  // Add a sample user
  console.log('\n👤 Adding sample user...');
  await setDoc(doc(db, 'users', '94700000001'), {
    name: 'Saman Perera',
    email: 'saman@gmail.com',
    phone: '+94700000001',
    district: 'Colombo',
    language: 'English',
    isVerified: true,
    createdAt: new Date().toISOString(),
  });
  console.log('   ✅ Sample user added!\n');

  console.log('══════════════════════════════════════');
  console.log(`🎉 Done! ${count} offers + 1 user added to Firebase!`);
  console.log('🔗 View at: https://console.firebase.google.com');
  console.log('   → offer-lanka → Firestore Database\n');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('\n❌ Seeding FAILED:', err.message);
  process.exit(1);
});
