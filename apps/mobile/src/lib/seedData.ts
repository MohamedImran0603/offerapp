import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit, getCountFromServer } from 'firebase/firestore';

const brands = [
  'Keells', 'Cargills', 'Arpico', 'Glomark', 'Softlogic', 'Abans', 'Damro', 'Singer', 'Odel', 'Dialog', 'Mobitel'
];

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
];

const flyerTemplates = [
  // Grocery
  { title: 'Keells Super Savers', sub: 'Weekly Grocery Deals', category: 'GROCERY', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
  { title: 'Cargills FoodCity Specials', sub: 'Fresh Produce Offers', category: 'GROCERY', img: 'https://images.unsplash.com/photo-1604719312563-88241df10188' },
  { title: 'Arpico Family Fair', sub: 'Home Essentials Catalog', category: 'GROCERY', img: 'https://images.unsplash.com/photo-1534452285582-8eb254bc09e5' },
  // Electronics
  { title: 'Softlogic Digital Expo', sub: 'Smartphone & TV Offers', category: 'ELECTRONICS', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1' },
  { title: 'Abans Tech Fest', sub: 'Home Appliance Sale', category: 'ELECTRONICS', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03' },
  { title: 'Singer Mega Sale', sub: 'Kitchen Tech Specials', category: 'ELECTRONICS', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
  // Furniture
  { title: 'Damro Comfort Living', sub: 'Sofa & Bed Collection', category: 'FURNITURE', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc' },
  { title: 'Arpico Furniture Fair', sub: 'Modern Home Decor', category: 'FURNITURE', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88' },
  // Clothing
  { title: 'Odel Style Guide', sub: 'Summer Fashion Trends', category: 'CLOTHING', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8' },
  { title: 'Nolimit New Arrivals', sub: 'Family Apparel Sale', category: 'CLOTHING', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e' },
];

export const seedDatabase = async () => {
  try {
    const offersRef = collection(db, 'offers');
    const snapshot = await getCountFromServer(offersRef);
    const count = snapshot.data().count;

    if (count < 50) { 
      console.log(`Current count ${count}. Seeding with 160 flyer-style products...`);
      
      for (let i = 0; i < 160; i++) {
        const template = flyerTemplates[i % flyerTemplates.length];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const district = districts[Math.floor(Math.random() * districts.length)];
        const pages = 8 + Math.floor(Math.random() * 20);
        const daysLeft = 2 + Math.floor(Math.random() * 10);

        await addDoc(offersRef, {
          title: template.title,
          subTitle: template.sub,
          store: brand,
          district: district,
          category: template.category,
          image: `${template.img}?auto=format&fit=crop&q=80&w=800`,
          brand: brand,
          pages: pages,
          daysLeft: daysLeft,
          isTop: Math.random() > 0.8,
          createdAt: new Date().toISOString()
        });
      }
      console.log("Flyer-style seeding complete!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
