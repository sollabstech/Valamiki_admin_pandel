import { Product, Category, Order, Banner, Offer, DashboardStats, User } from './types';

export const mockStats: DashboardStats = {
  totalOrders: 1284,
  totalRevenue: 284560,
  totalProducts: 148,
  totalUsers: 3421,
  pendingOrders: 23,
  todayOrders: 47,
  todayRevenue: 12890,
};

export const mockCategories: Category[] = [
  { id: 'grocery', name: 'Grocery', icon: '🥦', color: '#4CAF50', productCount: 64, isActive: true, sortOrder: 1 },
  { id: 'stationery', name: 'Stationery', icon: '✏️', color: '#2196F3', productCount: 38, isActive: true, sortOrder: 2 },
  { id: 'snacks', name: 'Snacks', icon: '🍟', color: '#FF9800', productCount: 22, isActive: true, sortOrder: 3 },
  { id: 'household', name: 'Household', icon: '🏠', color: '#9C27B0', productCount: 15, isActive: true, sortOrder: 4 },
  { id: 'daily_essentials', name: 'Daily Essentials', icon: '🧴', color: '#E91E63', productCount: 9, isActive: true, sortOrder: 5 },
];

export const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Fresh Tomatoes', description: 'Farm fresh red tomatoes, rich in antioxidants.',
    categoryId: 'grocery', categoryName: 'Grocery', price: 60, discountPrice: 49, discountPercent: 18,
    images: [], unit: '500g', stock: 100, isAvailable: true, isFeatured: true, isPopular: true,
    isFlashDeal: false, rating: 4.5, reviewCount: 128, tags: ['fresh', 'vegetable'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'p2', name: 'Classmate Notebook', description: '200 pages ruled notebook, premium quality.',
    categoryId: 'stationery', categoryName: 'Stationery', price: 85, discountPrice: 70, discountPercent: 18,
    images: [], unit: '1 piece', stock: 50, isAvailable: true, isFeatured: true, isPopular: false,
    isFlashDeal: false, rating: 4.3, reviewCount: 56, tags: ['notebook', 'school'],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'p3', name: 'Lays Classic Chips', description: 'Crispy salted potato chips.',
    categoryId: 'snacks', categoryName: 'Snacks', price: 20, discountPrice: 18, discountPercent: 10,
    images: [], unit: '26g', stock: 200, isAvailable: true, isFeatured: false, isPopular: true,
    isFlashDeal: true, rating: 4.7, reviewCount: 312, tags: ['chips', 'snack'],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'p4', name: 'Tata Salt', description: 'Iodized salt for healthy cooking.',
    categoryId: 'grocery', categoryName: 'Grocery', price: 28, discountPrice: 25, discountPercent: 11,
    images: [], unit: '1 kg', stock: 300, isAvailable: true, isFeatured: false, isPopular: true,
    isFlashDeal: false, rating: 4.8, reviewCount: 890, tags: ['salt', 'essential'],
    createdAt: new Date('2024-02-05'),
  },
  {
    id: 'p5', name: 'Geometry Box Set', description: 'Complete geometry set with compass, protractor.',
    categoryId: 'stationery', categoryName: 'Stationery', price: 120, discountPrice: 99, discountPercent: 17,
    images: [], unit: '1 set', stock: 40, isAvailable: true, isFeatured: true, isPopular: false,
    isFlashDeal: false, rating: 4.2, reviewCount: 34, tags: ['geometry', 'school'],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'p6', name: 'Amul Butter', description: 'Pasteurized butter, made from fresh cream.',
    categoryId: 'grocery', categoryName: 'Grocery', price: 58, discountPrice: 55, discountPercent: 5,
    images: [], unit: '100g', stock: 80, isAvailable: true, isFeatured: false, isPopular: true,
    isFlashDeal: true, rating: 4.6, reviewCount: 445, tags: ['dairy', 'butter'],
    createdAt: new Date('2024-02-12'),
  },
  {
    id: 'p7', name: 'Reynolds Pen Set', description: '10-piece ball point pen set, blue ink.',
    categoryId: 'stationery', categoryName: 'Stationery', price: 45, discountPrice: 0, discountPercent: 0,
    images: [], unit: '10 pens', stock: 0, isAvailable: false, isFeatured: false, isPopular: false,
    isFlashDeal: false, rating: 4.0, reviewCount: 22, tags: ['pen', 'writing'],
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'p8', name: 'Britannia Good Day', description: 'Butter cookies, perfect for tea time.',
    categoryId: 'snacks', categoryName: 'Snacks', price: 35, discountPrice: 30, discountPercent: 14,
    images: [], unit: '200g', stock: 150, isAvailable: true, isFeatured: true, isPopular: true,
    isFlashDeal: false, rating: 4.5, reviewCount: 201, tags: ['cookies', 'biscuit'],
    createdAt: new Date('2024-02-18'),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord001', userId: 'user1',
    products: [
      { productId: 'p1', name: 'Fresh Tomatoes', imageUrl: '', price: 60, discountPrice: 49, unit: '500g', quantity: 2, totalPrice: 98 },
      { productId: 'p4', name: 'Tata Salt', imageUrl: '', price: 28, discountPrice: 25, unit: '1 kg', quantity: 1, totalPrice: 25 },
    ],
    subtotal: 123, deliveryCharge: 40, discount: 0, totalPrice: 163,
    deliveryAddress: { id: 'a1', name: 'Rahul Sharma', phone: '9876543210', street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', type: 'home', isDefault: true },
    paymentMethod: 'Cash on Delivery', orderStatus: 'pending',
    createdAt: new Date('2024-06-26T10:30:00'),
  },
  {
    id: 'ord002', userId: 'user2',
    products: [
      { productId: 'p2', name: 'Classmate Notebook', imageUrl: '', price: 85, discountPrice: 70, unit: '1 piece', quantity: 3, totalPrice: 210 },
    ],
    subtotal: 210, deliveryCharge: 0, discount: 0, totalPrice: 210,
    deliveryAddress: { id: 'a2', name: 'Priya Menon', phone: '9123456789', street: '45 Park Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', type: 'home', isDefault: true },
    paymentMethod: 'Cash on Delivery', orderStatus: 'confirmed',
    createdAt: new Date('2024-06-26T09:15:00'),
  },
  {
    id: 'ord003', userId: 'user3',
    products: [
      { productId: 'p6', name: 'Amul Butter', imageUrl: '', price: 58, discountPrice: 55, unit: '100g', quantity: 2, totalPrice: 110 },
      { productId: 'p3', name: 'Lays Classic Chips', imageUrl: '', price: 20, discountPrice: 18, unit: '26g', quantity: 4, totalPrice: 72 },
    ],
    subtotal: 182, deliveryCharge: 0, discount: 0, totalPrice: 182,
    deliveryAddress: { id: 'a3', name: 'Amit Patel', phone: '8765432109', street: '78 Satellite Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', type: 'work', isDefault: false },
    paymentMethod: 'Cash on Delivery', orderStatus: 'shipped',
    createdAt: new Date('2024-06-25T16:45:00'),
  },
  {
    id: 'ord004', userId: 'user4',
    products: [
      { productId: 'p8', name: 'Britannia Good Day', imageUrl: '', price: 35, discountPrice: 30, unit: '200g', quantity: 2, totalPrice: 60 },
    ],
    subtotal: 60, deliveryCharge: 40, discount: 0, totalPrice: 100,
    deliveryAddress: { id: 'a4', name: 'Sneha Reddy', phone: '7654321098', street: '23 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', type: 'home', isDefault: true },
    paymentMethod: 'Cash on Delivery', orderStatus: 'delivered',
    createdAt: new Date('2024-06-24T14:20:00'),
  },
  {
    id: 'ord005', userId: 'user5',
    products: [
      { productId: 'p5', name: 'Geometry Box Set', imageUrl: '', price: 120, discountPrice: 99, unit: '1 set', quantity: 1, totalPrice: 99 },
    ],
    subtotal: 99, deliveryCharge: 40, discount: 0, totalPrice: 139,
    deliveryAddress: { id: 'a5', name: 'Karthik Nair', phone: '9988776655', street: '5 Marine Drive', city: 'Kochi', state: 'Kerala', pincode: '682001', type: 'home', isDefault: true },
    paymentMethod: 'Cash on Delivery', orderStatus: 'cancelled',
    createdAt: new Date('2024-06-23T11:00:00'),
  },
];

export const mockBanners: Banner[] = [
  { id: 'b1', imageUrl: '', title: 'Fresh Groceries', subtitle: 'Up to 30% Off', linkType: 'category', linkValue: 'grocery', isActive: true, sortOrder: 1 },
  { id: 'b2', imageUrl: '', title: 'Stationery Sale', subtitle: 'Buy 2 Get 1 Free', linkType: 'category', linkValue: 'stationery', isActive: true, sortOrder: 2 },
  { id: 'b3', imageUrl: '', title: 'Flash Deals', subtitle: 'Limited Time Offers', linkType: 'category', linkValue: 'snacks', isActive: false, sortOrder: 3 },
];

export const mockOffers: Offer[] = [
  {
    id: 'off1', title: 'Welcome Offer', description: 'Get 20% off on your first order', type: 'percentage',
    value: 20, minOrderValue: 200, maxDiscount: 100, code: 'WELCOME20', isActive: true,
    startDate: new Date('2024-06-01'), endDate: new Date('2024-12-31'), usageLimit: 1000, usageCount: 234,
  },
  {
    id: 'off2', title: 'Free Delivery', description: 'Free delivery on orders above ₹399', type: 'free_delivery',
    value: 0, minOrderValue: 399, maxDiscount: 40, code: 'FREEDEL', isActive: true,
    startDate: new Date('2024-06-01'), endDate: new Date('2024-07-31'), usageLimit: 5000, usageCount: 1023,
  },
  {
    id: 'off3', title: 'Flat ₹50 Off', description: 'Flat ₹50 off on grocery orders', type: 'flat',
    value: 50, minOrderValue: 300, maxDiscount: 50, code: 'GROCERY50', isActive: false,
    startDate: new Date('2024-05-01'), endDate: new Date('2024-05-31'), usageLimit: 2000, usageCount: 1875,
  },
  {
    id: 'off4', title: 'Stationery BOGO', description: 'Buy any stationery item, get one free', type: 'bogo',
    value: 0, minOrderValue: 150, code: 'STATBOGO', isActive: true,
    startDate: new Date('2024-06-15'), endDate: new Date('2024-06-30'), usageLimit: 500, usageCount: 89,
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '9876543210',
    totalOrders: 12, totalSpent: 4560, createdAt: new Date('2024-01-10'),
    addresses: [{ id: 'a1', name: 'Rahul Sharma', phone: '9876543210', street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', type: 'home', isDefault: true }],
  },
  {
    id: 'user2', name: 'Priya Menon', email: 'priya.menon@gmail.com', phone: '9123456789',
    totalOrders: 7, totalSpent: 2890, createdAt: new Date('2024-02-05'),
    addresses: [{ id: 'a2', name: 'Priya Menon', phone: '9123456789', street: '45 Park Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', type: 'home', isDefault: true }],
  },
  {
    id: 'user3', name: 'Amit Patel', email: 'amit.patel@gmail.com', phone: '8765432109',
    totalOrders: 23, totalSpent: 8340, createdAt: new Date('2024-01-25'),
    addresses: [
      { id: 'a3', name: 'Amit Patel', phone: '8765432109', street: '78 Satellite Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', type: 'work', isDefault: false },
      { id: 'a3b', name: 'Amit Patel', phone: '8765432109', street: '12 Vastrapur Lake', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', type: 'home', isDefault: true },
    ],
  },
  {
    id: 'user4', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '7654321098',
    totalOrders: 5, totalSpent: 1250, createdAt: new Date('2024-03-01'),
    addresses: [{ id: 'a4', name: 'Sneha Reddy', phone: '7654321098', street: '23 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', type: 'home', isDefault: true }],
  },
  {
    id: 'user5', name: 'Karthik Nair', email: 'karthik.nair@gmail.com', phone: '9988776655',
    totalOrders: 1, totalSpent: 139, createdAt: new Date('2024-06-20'),
    addresses: [],
  },
  {
    id: 'user6', name: 'Divya Singh', email: 'divya.singh@gmail.com', phone: '8899001122',
    totalOrders: 34, totalSpent: 15200, createdAt: new Date('2023-12-01'),
    addresses: [{ id: 'a6', name: 'Divya Singh', phone: '8899001122', street: '9 Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001', type: 'home', isDefault: true }],
  },
  {
    id: 'user7', name: 'Arjun Kapoor', email: 'arjun.kapoor@gmail.com',
    totalOrders: 0, totalSpent: 0, createdAt: new Date('2024-06-25'),
    addresses: [],
  },
];

export const revenueChartData = [
  { month: 'Jan', revenue: 18400, orders: 142 },
  { month: 'Feb', revenue: 22800, orders: 189 },
  { month: 'Mar', revenue: 19600, orders: 156 },
  { month: 'Apr', revenue: 28900, orders: 234 },
  { month: 'May', revenue: 31200, orders: 267 },
  { month: 'Jun', revenue: 24500, orders: 198 },
];
