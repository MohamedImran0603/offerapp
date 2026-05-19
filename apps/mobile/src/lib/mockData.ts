export const districts = [
  'Whole Country', 'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 
  'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const mainCategories = [
  'ALL', 'Electronics', 'Food - Grocery', 'Fruits & Vegetable', 'Dairy & Eggs', 
  'Chicken, Meat & Fish', 'Frozen Food', 'Drinks & Beverages', 'Bakery & Confectionary',
  'Health & Beauty', 'Baby & Mom Care', 'Laundry & Cleaning', 'Tissue & Disposables',
  'Home & Lifestyle', 'Clothing & Apparels'
];

export const brands = [
  { name: 'Singer', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=singer.lk' },
  { name: 'Damro', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=damro.lk' },
  { name: 'Abans', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=buyabans.com' },
  { name: 'Softlogic', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=mysoftlogic.lk' },
  { name: 'Arpico', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=arpicosupercentre.com' },
  { name: 'Keells', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=keellssuper.com' },
  { name: 'Cargills', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=cargillsonline.com' },
  { name: 'Glomark', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=glomark.lk' },
  { name: 'Odel', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=odel.lk' },
  { name: 'Nolimit', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=nolimit.lk' },
  { name: 'Fashion Bug', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=fashionbug.lk' },
  { name: 'Cool Planet', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=coolplanet.lk' },
  { name: 'House of Fashion', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=houseoffashions.lk' },
  { name: 'Daraz', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=daraz.lk' },
];

const uniqueProducts = [
  { name: 'Apple iPhone 15 128GB', sub: 'Titanium Design · A16 Bionic', cat: 'Electronics' },
  { name: 'Samsung Galaxy S24 Ultra', sub: '200MP Camera · Snapdragon Gen 3', cat: 'Electronics' },
  { name: 'Sony PlayStation 5 Slim', sub: '4K HDR · 1TB SSD', cat: 'Electronics' },
  { name: 'Keells Super Savers', sub: 'Weekly Grocery Deals', cat: 'Food - Grocery' },
  { name: 'Cargills FoodCity Specials', sub: 'Fresh Produce Offers', cat: 'Food - Grocery' },
  { name: 'Arpico Family Fair', sub: 'Home Essentials Catalog', cat: 'Food - Grocery' },
  { name: 'Glomark Daily Deals', sub: 'Premium Grocery Savings', cat: 'Food - Grocery' },
  { name: 'Softlogic Digital Expo', sub: 'Smartphone & TV Offers', cat: 'Electronics' },
  { name: 'Abans Tech Fest', sub: 'Home Appliance Sale', cat: 'Electronics' },
  { name: 'Singer Mega Sale', sub: 'Kitchen Tech Specials', cat: 'Electronics' },
  { name: 'Fresh Morning Picks', sub: 'Organic Farm Fresh', cat: 'Fruits & Vegetable' },
  { name: 'Odel Style Guide', sub: 'Summer Fashion Trends', cat: 'Clothing & Apparels' },
];

export const generateMockFlyers = () => {
  const mockDists = districts.slice(1);
  const mockImgs = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e', 
    'https://images.unsplash.com/photo-1604719312563-88241df10188', 
    'https://images.unsplash.com/photo-1534452285582-8eb254bc09e5', 
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8', 
    'https://images.unsplash.com/photo-1556742049-0adff2f6a477', 
  ];

  const allMocks = [];
  for (let i = 0; i < 180; i++) {
    const template = uniqueProducts[i % uniqueProducts.length];
    const brand = brands[i % brands.length].name;
    const dist = mockDists[i % mockDists.length];
    const pages = 4 + Math.floor(Math.random() * 24);
    const daysLeft = 1 + Math.floor(Math.random() * 12);
    const oldPrice = 500 + Math.floor(Math.random() * 10000);
    const newPrice = oldPrice * 0.8;

    allMocks.push({
      id: `flyer-mock-${i}`,
      title: template.name,
      subTitle: template.sub || 'Special Offer',
      store: brand,
      district: dist,
      category: template.cat,
      image: `${mockImgs[i % mockImgs.length]}?auto=format&fit=crop&q=80&w=800`,
      brand,
      pages,
      daysLeft,
      oldPrice,
      newPrice,
      isTop: i < 20
    });
  }
  return allMocks;
};

export const mockData = generateMockFlyers();
