// Run: node scripts/seed-products.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBmfQ9R3mvtqB0atQLByt1_XxyiaNRhlPg',
  authDomain: 'valamiki.firebaseapp.com',
  projectId: 'valamiki',
  storageBucket: 'valamiki.firebasestorage.app',
  messagingSenderId: '603268214018',
  appId: '1:603268214018:web:c12aa3dde1f69888d5261b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  // ── GROCERY ──────────────────────────────────────────────────
  {
    name: 'Fresh Tomatoes',
    description: 'Farm-fresh red tomatoes, rich in vitamins and antioxidants. Perfect for curries, salads and chutneys.',
    categoryId: 'grocery', categoryName: 'Grocery',
    price: 60, discountPrice: 45, discountPercent: 25,
    images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'],
    unit: '500g', stock: 120,
    isAvailable: true, isFeatured: true, isPopular: true, isFlashDeal: false,
    rating: 4.5, reviewCount: 128, tags: ['vegetable', 'fresh', 'organic'],
  },
  {
    name: 'Amul Butter',
    description: 'Pasteurised butter made from fresh cream. Rich, creamy taste for bread, rotis and cooking.',
    categoryId: 'grocery', categoryName: 'Grocery',
    price: 58, discountPrice: 52, discountPercent: 10,
    images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80'],
    unit: '100g', stock: 80,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: false,
    rating: 4.8, reviewCount: 445, tags: ['dairy', 'butter'],
  },
  {
    name: 'Tata Salt',
    description: 'Iodized vacuum-evaporated salt. Trusted by Indian households for over 40 years.',
    categoryId: 'grocery', categoryName: 'Grocery',
    price: 28, discountPrice: 24, discountPercent: 14,
    images: ['https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80'],
    unit: '1 kg', stock: 300,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: false,
    rating: 4.9, reviewCount: 890, tags: ['salt', 'cooking', 'essential'],
  },
  {
    name: 'Basmati Rice',
    description: 'Premium long-grain basmati rice with a natural fragrance. Perfect for biryani and pulao.',
    categoryId: 'grocery', categoryName: 'Grocery',
    price: 180, discountPrice: 149, discountPercent: 17,
    images: ['https://images.unsplash.com/photo-1536304993881-ff86e6d79de0?w=400&q=80'],
    unit: '1 kg', stock: 200,
    isAvailable: true, isFeatured: true, isPopular: false, isFlashDeal: true,
    rating: 4.6, reviewCount: 234, tags: ['rice', 'basmati', 'grain'],
  },
  {
    name: 'Onions',
    description: 'Fresh red onions sourced from local farms. Essential kitchen staple for all Indian cooking.',
    categoryId: 'grocery', categoryName: 'Grocery',
    price: 40, discountPrice: 32, discountPercent: 20,
    images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80'],
    unit: '1 kg', stock: 150,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: true,
    rating: 4.3, reviewCount: 67, tags: ['vegetable', 'fresh'],
  },

  // ── SNACKS ───────────────────────────────────────────────────
  {
    name: 'Lays Classic Salted',
    description: 'Crispy wafer-thin potato chips with a light, perfect salted crunch. The #1 snack in India.',
    categoryId: 'snacks', categoryName: 'Snacks',
    price: 20, discountPrice: 18, discountPercent: 10,
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80'],
    unit: '26g', stock: 500,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: true,
    rating: 4.7, reviewCount: 312, tags: ['chips', 'snacks', 'crispy'],
  },
  {
    name: 'Parle-G Biscuits',
    description: 'India\'s favourite glucose biscuits. Enjoy with chai or as a quick energy snack anytime.',
    categoryId: 'snacks', categoryName: 'Snacks',
    price: 10, discountPrice: 0, discountPercent: 0,
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80'],
    unit: '100g', stock: 400,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: false,
    rating: 4.8, reviewCount: 1200, tags: ['biscuit', 'glucose', 'snack'],
  },

  // ── STATIONERY ───────────────────────────────────────────────
  {
    name: 'Classmate Notebook',
    description: '200-page ruled notebook with thick, ink-resistant pages. Ideal for school and college students.',
    categoryId: 'stationery', categoryName: 'Stationery',
    price: 85, discountPrice: 69, discountPercent: 19,
    images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80'],
    unit: '1 piece', stock: 50,
    isAvailable: true, isFeatured: true, isPopular: false, isFlashDeal: false,
    rating: 4.3, reviewCount: 56, tags: ['notebook', 'study', 'stationery'],
  },
  {
    name: 'Geometry Box Set',
    description: 'Complete geometry set with compass, protractor, set squares, divider and ruler in a metal case.',
    categoryId: 'stationery', categoryName: 'Stationery',
    price: 120, discountPrice: 95, discountPercent: 21,
    images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80'],
    unit: '1 set', stock: 40,
    isAvailable: true, isFeatured: true, isPopular: false, isFlashDeal: false,
    rating: 4.2, reviewCount: 34, tags: ['geometry', 'math', 'school'],
  },
  {
    name: 'Reynolds Ball Pen (Pack of 10)',
    description: 'Smooth-writing blue ball pens with comfortable grip. Long-lasting ink for everyday writing.',
    categoryId: 'stationery', categoryName: 'Stationery',
    price: 75, discountPrice: 59, discountPercent: 21,
    images: ['https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80'],
    unit: '10 pens', stock: 100,
    isAvailable: true, isFeatured: false, isPopular: true, isFlashDeal: true,
    rating: 4.5, reviewCount: 89, tags: ['pen', 'writing', 'stationery'],
  },

  // ── BEVERAGES ────────────────────────────────────────────────
  {
    name: 'Bru Instant Coffee',
    description: 'South India\'s favourite instant coffee. Rich, aromatic brew ready in seconds. Perfect morning pick-me-up.',
    categoryId: 'beverages', categoryName: 'Beverages',
    price: 99, discountPrice: 85, discountPercent: 14,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80'],
    unit: '100g', stock: 60,
    isAvailable: true, isFeatured: true, isPopular: true, isFlashDeal: false,
    rating: 4.6, reviewCount: 178, tags: ['coffee', 'instant', 'beverage'],
  },
  {
    name: 'Tata Tea Gold',
    description: 'Premium Assam tea leaves blended for a strong, refreshing cup. The most trusted brand in India.',
    categoryId: 'beverages', categoryName: 'Beverages',
    price: 145, discountPrice: 125, discountPercent: 14,
    images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80'],
    unit: '250g', stock: 90,
    isAvailable: true, isFeatured: true, isPopular: true, isFlashDeal: false,
    rating: 4.7, reviewCount: 320, tags: ['tea', 'assam', 'beverage'],
  },
];

async function seed() {
  console.log('🌱 Seeding Valamiki products to Firestore...\n');

  // Clear existing products first
  const existing = await getDocs(collection(db, 'products'));
  if (existing.size > 0) {
    console.log(`🗑  Removing ${existing.size} existing products...`);
    for (const d of existing.docs) {
      await deleteDoc(d.ref);
    }
  }

  // Add new products
  for (const product of products) {
    const doc = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Added: ${product.name} (${doc.id})`);
  }

  console.log(`\n🎉 Done! ${products.length} products added to Firestore.`);
  console.log('   Flutter app will show them in real-time.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
