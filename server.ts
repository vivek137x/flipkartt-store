import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { PRODUCTS as SEED_PRODUCTS } from './src/data';
import { adjustProductMobilePrice } from './src/types';
import Razorpay from 'razorpay';

const app = express();
const PORT = 3000;

// CORS support middleware to avoid front-to-back blocking across custom domains
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse incoming request bodies as JSON
app.use(express.json());

// JSON storage paths
const PRODUCTS_DB_PATH = path.join(process.cwd(), 'products_db.json');
const ORDERS_DB_PATH = path.join(process.cwd(), 'orders_db.json');
const SETTINGS_DB_PATH = path.join(process.cwd(), 'settings_db.json');
const COUPONS_DB_PATH = path.join(process.cwd(), 'coupons_db.json');
const USERS_DB_PATH = path.join(process.cwd(), 'users_db.json');

// --- MONGODB ATLAS INTEGRATION LAYER ---
import mongoose from 'mongoose';

let isMongoConnected = false;
const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  console.log('[MONGO] Attempting connection to MongoDB Atlas...');
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('[MONGO_OK] Successfully connected to MongoDB Atlas!');
      isMongoConnected = true;
      syncFileToMongo();
    })
    .catch((err) => {
      console.error('[MONGO_ERROR] Failed to establish connection to MongoDB Atlas:', err.message);
      console.log('[MONGO] Falling back to high-performance local JSON file storage.');
    });
} else {
  console.log('[MONGO] No MONGODB_URI found. Running in pure local JSON File database mode.');
}

// Sub schematics
const specificationSchema = new mongoose.Schema({
  label: String,
  value: String
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  id: String,
  userName: String,
  rating: Number,
  comment: String,
  date: String,
  verified: Boolean
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  title: String,
  tagline: String,
  bg: String,
  badge: String,
  image: String,
  cta: String
}, { _id: false });

// Models
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  categoryLabel: String,
  brand: String,
  price: { type: Number, default: 99 },
  mrp: { type: Number, default: 999 },
  rating: { type: Number, default: 4.5 },
  ratingCount: { type: Number, default: 10 },
  reviewCount: { type: Number, default: 0 },
  images: [String],
  description: String,
  highlights: [String],
  specifications: [specificationSchema],
  reviews: [reviewSchema],
  stock: { type: Number, default: 50 },
  assured: { type: Boolean, default: true },
  isBestSeller: Boolean
}, { timestamps: true });

const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const orderItemSchema = new mongoose.Schema({
  product: mongoose.Schema.Types.Mixed,
  quantity: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  items: [orderItemSchema],
  totalAmount: Number,
  status: { type: String, default: 'ordered' },
  paymentMethod: { type: String, default: 'UPI' },
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine: String,
    city: String,
    pincode: String,
    state: String
  }
}, { timestamps: true });

const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'site_settings', unique: true },
  merchantUpi: String,
  merchantName: String,
  logoUrl: String,
  promoHeadline: String,
  promoSubheadline: String,
  homepageBanners: [bannerSchema],
  qrCode: String
}, { timestamps: true });

const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: Number,
  type: { type: String, default: 'percentage' },
  active: { type: Boolean, default: true },
  description: String
}, { timestamps: true });

const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  blocked: { type: Boolean, default: false },
  date: String
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Memory cache registers for extreme responsiveness and speed
let productsCache: any[] = [];
let ordersCache: any[] = [];
let settingsCache: any = null;
let couponsCache: any[] = [];
let usersCache: any[] = [];

// --- DATABASE HANDLERS ---
const getProducts = (): any[] => {
  const baseList = productsCache.length > 0 ? productsCache : loadProductsFromFile();
  return (baseList || []).map(adjustProductMobilePrice);
};

const loadProductsFromFile = (): any[] => {
  try {
    if (fs.existsSync(PRODUCTS_DB_PATH)) {
      productsCache = JSON.parse(fs.readFileSync(PRODUCTS_DB_PATH, 'utf-8'));
      return productsCache;
    }
    fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf-8');
    productsCache = [...SEED_PRODUCTS];
    return productsCache;
  } catch (err) {
    console.error('Products seed/load error:', err);
    productsCache = SEED_PRODUCTS || [];
    return productsCache;
  }
};

const saveProducts = (data: any[]) => {
  productsCache = [...data];
  fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  if (isMongoConnected) {
    // Background async sync to avoid blocking event loops
    (async () => {
      try {
        await (ProductModel as any).deleteMany({});
        await (ProductModel as any).insertMany(data);
      } catch (err: any) {
        console.error('[MONGO_WRITE_ERR] Failed to sync products to Atlas:', err.message);
      }
    })();
  }
};

const getOrders = (): any[] => {
  return ordersCache.length > 0 ? ordersCache : loadOrdersFromFile();
};

const loadOrdersFromFile = (): any[] => {
  try {
    if (fs.existsSync(ORDERS_DB_PATH)) {
      ordersCache = JSON.parse(fs.readFileSync(ORDERS_DB_PATH, 'utf-8'));
      return ordersCache;
    }
    fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
    ordersCache = [];
    return ordersCache;
  } catch {
    ordersCache = [];
    return ordersCache;
  }
};

const saveOrders = (data: any[]) => {
  ordersCache = [...data];
  fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  if (isMongoConnected) {
    (async () => {
      try {
        await (OrderModel as any).deleteMany({});
        await (OrderModel as any).insertMany(data);
      } catch (err: any) {
        console.error('[MONGO_WRITE_ERR] Failed to sync orders to Atlas:', err.message);
      }
    })();
  }
};

const defaultSettings = {
  merchantUpi: 'thakurshivrajsingh170@oksbi',
  merchantName: 'ShivrajStore',
  logoUrl: '',
  qrCode: '',
  cashfreeAppId: process.env.CASHFREE_APP_ID || '',
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || '',
  cashfreeEnvironment: 'SANDBOX',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  promoHeadline: 'LATEST FASHION MEGAPORT - FLAT ₹99!',
  promoSubheadline: 'Trendy Roadster shirts, luxury ZARA dresses, US Polo tees, Levi\'s jeans, and BIBA sets at flat ₹99!',
  homepageBanners: [
    {
      title: 'LATEST FASHION MEGAPORT - FLAT ₹99!',
      tagline: 'Trendy Roadster shirts, luxury ZARA dresses, US Polo tees, Levi\'s jeans, and BIBA sets at flat ₹99!',
      bg: 'from-[#ec4899] via-[#d946ef] to-[#8b5cf6]',
      badge: '90%+ OFF LATEST TRENDS',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80',
      cta: 'Shop Fashion Parade'
    },
    {
      title: 'BIG BILLION SAVINGS: FLAT ₹99 EXTREME STORE!',
      tagline: 'Samsung S24 Ultra, Apple M3 MacBooks, boAt Rockerz - All Flat ₹99!',
      bg: 'from-[#0f172a] via-[#1e3a8a] to-[#2874f0]',
      badge: 'FLIPCART PLUS EXCLUSIVE',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
      cta: 'Flat 90%+ Off'
    },
    {
      title: 'BOAT BASSHEADS AUDIO ZONE - FLAT ₹99',
      tagline: 'Bass-boosted Earbuds, Bluetooth Neckbands, and portable speakers at unbelievable prices!',
      bg: 'from-[#881337] via-[#dc2626] to-[#fb7185]',
      badge: 'OFFICIAL BRAND DEALS',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80',
      cta: 'Shop boAt Specials'
    }
  ]
};

const getSettings = () => {
  if (settingsCache) return settingsCache;
  return loadSettingsFromFile();
};

const loadSettingsFromFile = () => {
  try {
    if (fs.existsSync(SETTINGS_DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_DB_PATH, 'utf-8'));
      settingsCache = { ...defaultSettings, ...data };
      return settingsCache;
    }
    fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    settingsCache = { ...defaultSettings };
    return settingsCache;
  } catch {
    settingsCache = { ...defaultSettings };
    return settingsCache;
  }
};

const saveSettings = (data: any) => {
  settingsCache = { ...data };
  fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  if (isMongoConnected) {
    (async () => {
      try {
        await (SettingsModel as any).findOneAndUpdate({ key: 'site_settings' }, data, { upsert: true });
      } catch (err: any) {
        console.error('[MONGO_WRITE_ERR] Failed to sync settings to Atlas:', err.message);
      }
    })();
  }
};

const defaultCoupons = [
  { code: 'WELCOME50', discount: 50, type: 'percentage', active: true, description: '50% Off on your first checkout!' },
  { code: 'FLAT99', discount: 99, type: 'flat', active: true, description: 'Flat Rupees 99 discount on bulk orders!' },
  { code: 'FREESHIP', discount: 15, type: 'percentage', active: true, description: 'Extra 15% discount for shipping convenience!' }
];

const getCoupons = (): any[] => {
  return couponsCache.length > 0 ? couponsCache : loadCouponsFromFile();
};

const loadCouponsFromFile = (): any[] => {
  try {
    if (fs.existsSync(COUPONS_DB_PATH)) {
      couponsCache = JSON.parse(fs.readFileSync(COUPONS_DB_PATH, 'utf-8'));
      return couponsCache;
    }
    fs.writeFileSync(COUPONS_DB_PATH, JSON.stringify(defaultCoupons, null, 2), 'utf-8');
    couponsCache = [...defaultCoupons];
    return couponsCache;
  } catch {
    couponsCache = [...defaultCoupons];
    return couponsCache;
  }
};

const saveCoupons = (data: any[]) => {
  couponsCache = [...data];
  fs.writeFileSync(COUPONS_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  if (isMongoConnected) {
    (async () => {
      try {
        await (CouponModel as any).deleteMany({});
        await (CouponModel as any).insertMany(data);
      } catch (err: any) {
        console.error('[MONGO_WRITE_ERR] Failed to sync coupons to Atlas:', err.message);
      }
    })();
  }
};

const defaultUsers = [
  { id: 'user-01', name: 'Aman Sharma', email: 'aman@techzone.com', phone: '+91 98765 43210', blocked: false, date: '12 May 2026' },
  { id: 'user-02', name: 'Priya Patel', email: 'priya@techzone.com', phone: '+91 87654 32109', blocked: false, date: '14 May 2026' },
  { id: 'user-03', name: 'Rohan Deshmukh', email: 'rohan@techzone.com', phone: '+91 76543 21098', blocked: false, date: '16 May 2026' }
];

const getUsers = (): any[] => {
  return usersCache.length > 0 ? usersCache : loadUsersFromFile();
};

const loadUsersFromFile = (): any[] => {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      usersCache = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf-8'));
      return usersCache;
    }
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    usersCache = [...defaultUsers];
    return usersCache;
  } catch {
    usersCache = [...defaultUsers];
    return usersCache;
  }
};

const saveUsers = (data: any[]) => {
  usersCache = [...data];
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  if (isMongoConnected) {
    (async () => {
      try {
        await (UserModel as any).deleteMany({});
        await (UserModel as any).insertMany(data);
      } catch (err: any) {
        console.error('[MONGO_WRITE_ERR] Failed to sync users to Atlas:', err.message);
      }
    })();
  }
};

// Seed/Sync existing file databases to MongoDB Atlas on initial boot
async function syncFileToMongo() {
  try {
    console.log('[MONGO] Initiating data synchronization sequence...');

    // Products Check & Seed
    const pCount = await (ProductModel as any).countDocuments();
    const diskProds = loadProductsFromFile();
    if (pCount === 0 && diskProds.length > 0) {
      await (ProductModel as any).insertMany(diskProds);
      console.log(`[MONGO_SYNC] Imported ${diskProds.length} products to MongoDB Atlas successfully.`);
    } else if (pCount > 0) {
      productsCache = await (ProductModel as any).find({}).lean();
      fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify(productsCache, null, 2), 'utf-8');
      console.log(`[MONGO_SYNC] Loaded ${pCount} products from MongoDB Atlas to local cache.`);
    }

    // Orders Sync
    const oCount = await (OrderModel as any).countDocuments();
    const diskOrders = loadOrdersFromFile();
    if (oCount === 0 && diskOrders.length > 0) {
      await (OrderModel as any).insertMany(diskOrders);
    } else if (oCount > 0) {
      ordersCache = await (OrderModel as any).find({}).lean();
      fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify(ordersCache, null, 2), 'utf-8');
    }

    // Settings Sync
    const sDoc = await (SettingsModel as any).findOne({ key: 'site_settings' });
    const diskSettings = loadSettingsFromFile();
    if (!sDoc) {
      await (SettingsModel as any).create({ key: 'site_settings', ...diskSettings });
    } else {
      settingsCache = { ...defaultSettings, ...sDoc.toObject() };
      fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(settingsCache, null, 2), 'utf-8');
    }

    // Coupons Sync
    const cCount = await (CouponModel as any).countDocuments();
    const diskCoupons = loadCouponsFromFile();
    if (cCount === 0 && diskCoupons.length > 0) {
      await (CouponModel as any).insertMany(diskCoupons);
    } else if (cCount > 0) {
      couponsCache = await (CouponModel as any).find({}).lean();
      fs.writeFileSync(COUPONS_DB_PATH, JSON.stringify(couponsCache, null, 2), 'utf-8');
    }

    // Users Sync
    const uCount = await (UserModel as any).countDocuments();
    const diskUsers = loadUsersFromFile();
    if (uCount === 0 && diskUsers.length > 0) {
      await (UserModel as any).insertMany(diskUsers);
    } else if (uCount > 0) {
      usersCache = await (UserModel as any).find({}).lean();
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(usersCache, null, 2), 'utf-8');
    }

    console.log('[MONGO_SYNC] Twin-sync database initialized successfully!');
  } catch (err: any) {
    console.error('[MONGO_SYNC_ERR] Failed database sync workflow:', err.message);
  }
}

// Ensure local cache is populated immediately
loadProductsFromFile();
loadOrdersFromFile();
loadSettingsFromFile();
loadCouponsFromFile();
loadUsersFromFile();

// Warn of UPI configuration setup status
function checkUPIConfiguration() {
  const settings = getSettings();
  const upiId = settings.merchantUpi || 'thakurshivrajsingh170@oksbi';
  const name = settings.merchantName || 'ShivrajStore';

  if (!upiId) {
    console.warn('[UPI CONFIG WARNING] Merchant UPI VPA ID is not prefilled.');
  } else {
    console.log('[UPI CONFIG OK] Default Direct merchant UPI ID set to:', upiId, 'under beneficiary:', name);
  }
}
checkUPIConfiguration();

const ADMIN_DB_PATH = path.join(process.cwd(), 'admin_db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'flipcart_plus_admin_jwt_secret_token_key_102938';

interface AdminData {
  email: string;
  passwordHash: string;
  recoveryPinHash: string;
}

const getAdminData = (): AdminData | null => {
  try {
    if (fs.existsSync(ADMIN_DB_PATH)) {
      const data = fs.readFileSync(ADMIN_DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[ADMIN DB ERROR] Failed to read admin database:', err);
  }
  return null;
};

const saveAdminData = (data: AdminData) => {
  try {
    fs.writeFileSync(ADMIN_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ADMIN DB ERROR] Failed to save admin database:', err);
  }
};

// Admin authentication middleware
const verifyAdminToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session token missing.' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Session expired or invalid. Please login again.' });
    }
    (req as any).adminEmail = decoded.email;
    next();
  });
};

// Check if admin is registered
app.get('/api/admin/status', (req, res) => {
  const admin = getAdminData();
  res.json({
    success: true,
    exists: !!admin
  });
});

// Admin Register (only if not already registered)
app.post(['/api/admin/register', '/admin/register'], (req, res) => {
  try {
    const { email, password, recoveryPin } = req.body;
    
    if (!email || !password || !recoveryPin) {
      return res.status(400).json({ success: false, error: 'Email, password, and secret recovery pin are required.' });
    }

    const currentAdmin = getAdminData();
    if (currentAdmin) {
      return res.status(400).json({ success: false, error: 'Administrator already registered. Registration closed.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const recoveryPinHash = bcrypt.hashSync(recoveryPin, 10);

    const newAdmin: AdminData = {
      email: email.trim().toLowerCase(),
      passwordHash,
      recoveryPinHash
    };

    saveAdminData(newAdmin);

    const token = jwt.sign({ email: newAdmin.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[ADMIN SECURE REGISTRATION] New administrator registered: ${newAdmin.email}`);
    res.json({
      success: true,
      message: 'Secure administrator account created successfully.',
      token,
      email: newAdmin.email
    });
  } catch (error: any) {
    console.error('[ADMIN REGISTRATION FAILED]', error);
    res.status(500).json({ success: false, error: error.message || 'Server failed to register administrator.' });
  }
});

// Admin Login
app.post(['/api/admin/login', '/admin/login'], (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const admin = getAdminData();
    if (!admin) {
      return res.status(404).json({ success: false, error: 'No administrator registered yet. Please register your account first.' });
    }

    if (email.trim().toLowerCase() !== admin.email) {
      return res.status(401).json({ success: false, error: 'Invalid administrator email address.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
    }

    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      email: admin.email
    });
  } catch (error: any) {
    console.error('[ADMIN LOGIN FAILED]', error);
    res.status(500).json({ success: false, error: error.message || 'Server encountered an login authentication error.' });
  }
});

// Admin Forgot Password (Reset password via recovery PIN)
app.post('/api/admin/forgot-password', (req, res) => {
  try {
    const { email, recoveryPin, newPassword } = req.body;
    if (!email || !recoveryPin || !newPassword) {
      return res.status(400).json({ success: false, error: 'All fields (email, recovery pin, and new password) are required.' });
    }

    const admin = getAdminData();
    if (!admin) {
      return res.status(404).json({ success: false, error: 'No administrator registered.' });
    }

    if (email.trim().toLowerCase() !== admin.email) {
      return res.status(401).json({ success: false, error: 'Email does not match registered administrator.' });
    }

    const pinMatch = bcrypt.compareSync(recoveryPin, admin.recoveryPinHash);
    if (!pinMatch) {
      return res.status(401).json({ success: false, error: 'Invalid secret recovery pin.' });
    }

    // PIN is correct, let's update password
    admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    saveAdminData(admin);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new credentials.'
    });
  } catch (error: any) {
    console.error('[ADMIN FORGOT PASSWORD FAILED]', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error during password reset.' });
  }
});

// Admin Update Credentials (authenticated route)
app.post('/api/admin/update-credentials', verifyAdminToken, (req, res) => {
  try {
    const { newEmail, newPassword, newRecoveryPin } = req.body;
    const admin = getAdminData();
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Administrator not found.' });
    }

    if (newEmail) {
      admin.email = newEmail.trim().toLowerCase();
    }
    if (newPassword) {
      admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    }
    if (newRecoveryPin) {
      admin.recoveryPinHash = bcrypt.hashSync(newRecoveryPin, 10);
    }

    saveAdminData(admin);

    res.json({
      success: true,
      message: 'Administrator login credentials updated successfully.',
      email: admin.email
    });
  } catch (error: any) {
    console.error('[ADMIN CREDENTIALS UPDATE FAILED]', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error updating administrator credentials.' });
  }
});

// Check auth token validity
app.get('/api/admin/verify', verifyAdminToken, (req, res) => {
  res.json({ success: true, email: (req as any).adminEmail });
});

// --- ADVANCED WEBSITE CODELESS CONTROL API ENDPOINTS ---

// PRODUCTS APIs
app.get(['/api/admin/products', '/products'], (req, res) => {
  res.json({ success: true, products: getProducts() });
});

app.post(['/api/admin/products', '/products'], verifyAdminToken, (req, res) => {
  try {
    const products = getProducts();
    const newProduct = req.body;
    if (!newProduct.id) {
      newProduct.id = 'prod-' + Date.now();
    }
    products.unshift(newProduct);
    saveProducts(products);
    res.json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/admin/products/:id', '/products/:id'], verifyAdminToken, (req, res) => {
  try {
    const products = getProducts();
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product SKU ID not found.' });
    }
    products[index] = { ...products[index], ...req.body };
    saveProducts(products);
    res.json({ success: true, product: products[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/admin/products/:id', '/products/:id'], verifyAdminToken, (req, res) => {
  try {
    const products = getProducts();
    const { id } = req.params;
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    res.json({ success: true, message: 'SKU product block deleted cleanly from database.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ORDERS APIs
app.get(['/api/admin/orders', '/orders'], (req, res) => {
  res.json({ success: true, orders: getOrders() });
});

app.post(['/api/admin/orders', '/orders'], (req, res) => {
  try {
    const orders = getOrders();
    const newOrder = req.body;
    orders.unshift(newOrder); // Prepend new order
    saveOrders(orders);
    res.json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/admin/orders/:id', '/orders/:id'], verifyAdminToken, (req, res) => {
  try {
    const orders = getOrders();
    const { id } = req.params;
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Order trace records not found.' });
    }
    orders[index] = { ...orders[index], ...req.body };
    saveOrders(orders);
    res.json({ success: true, order: orders[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/admin/orders/:id', '/orders/:id'], verifyAdminToken, (req, res) => {
  try {
    const orders = getOrders();
    const { id } = req.params;
    const filtered = orders.filter(o => o.id !== id);
    saveOrders(filtered);
    res.json({ success: true, message: 'Order removed cleanly from records.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SITE SETTINGS APIs
app.get(['/api/admin/settings', '/settings'], (req, res) => {
  res.json({ success: true, settings: getSettings() });
});

app.post(['/api/admin/settings', '/settings'], verifyAdminToken, (req, res) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...req.body };
    saveSettings(updated);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// COUPONS APIs
app.get('/api/admin/coupons', (req, res) => {
  res.json({ success: true, coupons: getCoupons() });
});

app.post('/api/admin/coupons', verifyAdminToken, (req, res) => {
  try {
    const coupons = getCoupons();
    const coupon = req.body;
    const index = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (index !== -1) {
      coupons[index] = { ...coupons[index], ...coupon };
    } else {
      coupons.push(coupon);
    }
    saveCoupons(coupons);
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/coupons/:code', verifyAdminToken, (req, res) => {
  try {
    const coupons = getCoupons();
    const { code } = req.params;
    const filtered = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    saveCoupons(filtered);
    res.json({ success: true, coupons: filtered });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// USER PERSISTENCE APIs
app.get('/api/admin/users', verifyAdminToken, (req, res) => {
  res.json({ success: true, users: getUsers() });
});

app.post('/api/admin/users', (req, res) => {
  try {
    const users = getUsers();
    const newUser = req.body;
    if (!newUser.id) newUser.id = 'user-' + Date.now();
    
    const exists = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      res.json({ success: true, user: exists });
    } else {
      users.push(newUser);
      saveUsers(users);
      res.json({ success: true, user: newUser });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/users/:id/block', verifyAdminToken, (req, res) => {
  try {
    const users = getUsers();
    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'User not found in system.' });
    }
    users[index].blocked = !users[index].blocked;
    saveUsers(users);
    res.json({ success: true, user: users[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/users/:id', verifyAdminToken, (req, res) => {
  try {
    const users = getUsers();
    const { id } = req.params;
    const filtered = users.filter(u => u.id !== id);
    saveUsers(filtered);
    res.json({ success: true, message: 'User file deleted cleanly from ledger.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET and PUT payment-settings API
app.get('/payment-settings', (req, res) => {
  const settings = getSettings();
  res.json({
    success: true,
    upiId: settings.merchantUpi || '',
    storeName: settings.merchantName || '',
    qrCode: settings.qrCode || '',
    cashfreeAppId: settings.cashfreeAppId || '',
    cashfreeSecretKey: settings.cashfreeSecretKey || '',
    cashfreeEnvironment: settings.cashfreeEnvironment || 'SANDBOX',
    razorpayKeyId: settings.razorpayKeyId || '',
    razorpayKeySecret: settings.razorpayKeySecret || '',
  });
});

app.get('/api/payment-settings', (req, res) => {
  const settings = getSettings();
  res.json({
    success: true,
    upiId: settings.merchantUpi || '',
    storeName: settings.merchantName || '',
    qrCode: settings.qrCode || '',
    cashfreeAppId: settings.cashfreeAppId || '',
    cashfreeSecretKey: settings.cashfreeSecretKey || '',
    cashfreeEnvironment: settings.cashfreeEnvironment || 'SANDBOX',
    razorpayKeyId: settings.razorpayKeyId || '',
    razorpayKeySecret: settings.razorpayKeySecret || '',
  });
});

app.put('/payment-settings', verifyAdminToken, (req, res) => {
  try {
    const current = getSettings();
    const { upiId, storeName, qrCode, cashfreeAppId, cashfreeSecretKey, cashfreeEnvironment, razorpayKeyId, razorpayKeySecret } = req.body;
    if (upiId !== undefined) current.merchantUpi = upiId;
    if (storeName !== undefined) current.merchantName = storeName;
    if (qrCode !== undefined) current.qrCode = qrCode;
    if (cashfreeAppId !== undefined) current.cashfreeAppId = cashfreeAppId;
    if (cashfreeSecretKey !== undefined) current.cashfreeSecretKey = cashfreeSecretKey;
    if (cashfreeEnvironment !== undefined) current.cashfreeEnvironment = cashfreeEnvironment;
    if (razorpayKeyId !== undefined) current.razorpayKeyId = razorpayKeyId;
    if (razorpayKeySecret !== undefined) current.razorpayKeySecret = razorpayKeySecret;
    saveSettings(current);
    res.json({
      success: true,
      settings: {
        upiId: current.merchantUpi,
        storeName: current.merchantName,
        qrCode: current.qrCode,
        cashfreeAppId: current.cashfreeAppId,
        cashfreeSecretKey: current.cashfreeSecretKey,
        cashfreeEnvironment: current.cashfreeEnvironment,
        razorpayKeyId: current.razorpayKeyId,
        razorpayKeySecret: current.razorpayKeySecret,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/payment-settings', verifyAdminToken, (req, res) => {
  try {
    const current = getSettings();
    const { upiId, storeName, qrCode, cashfreeAppId, cashfreeSecretKey, cashfreeEnvironment, razorpayKeyId, razorpayKeySecret } = req.body;
    if (upiId !== undefined) current.merchantUpi = upiId;
    if (storeName !== undefined) current.merchantName = storeName;
    if (qrCode !== undefined) current.qrCode = qrCode;
    if (cashfreeAppId !== undefined) current.cashfreeAppId = cashfreeAppId;
    if (cashfreeSecretKey !== undefined) current.cashfreeSecretKey = cashfreeSecretKey;
    if (cashfreeEnvironment !== undefined) current.cashfreeEnvironment = cashfreeEnvironment;
    if (razorpayKeyId !== undefined) current.razorpayKeyId = razorpayKeyId;
    if (razorpayKeySecret !== undefined) current.razorpayKeySecret = razorpayKeySecret;
    saveSettings(current);
    res.json({
      success: true,
      settings: {
        upiId: current.merchantUpi,
        storeName: current.merchantName,
        qrCode: current.qrCode,
        cashfreeAppId: current.cashfreeAppId,
        cashfreeSecretKey: current.cashfreeSecretKey,
        cashfreeEnvironment: current.cashfreeEnvironment,
        razorpayKeyId: current.razorpayKeyId,
        razorpayKeySecret: current.razorpayKeySecret,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── RAZORPAY PAYMENT GATEWAY ───────────────────────────────────────────────

// Create Razorpay order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const settings = getSettings();
    const keyId = settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '';
    const keySecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !keySecret) {
      return res.status(400).json({ success: false, error: 'Razorpay keys not configured.' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required.' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.json({ success: true, order, keyId });
  } catch (err: any) {
    console.error('[RAZORPAY] create-order error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create Razorpay order.' });
  }
});

// Verify Razorpay payment signature
app.post('/api/razorpay/verify-payment', (req, res) => {
  try {
    const settings = getSettings();
    const keySecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '';

    if (!keySecret) {
      return res.status(400).json({ success: false, error: 'Razorpay secret not configured.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
    } else {
      res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }
  } catch (err: any) {
    console.error('[RAZORPAY] verify-payment error:', err);
    res.status(500).json({ success: false, error: err.message || 'Verification error.' });
  }
});

// ─── CASHFREE PAYMENT GATEWAY ────────────────────────────────────────────────

// Create Cashfree order
app.post('/api/cashfree/create-order', async (req, res) => {
  try {
    const settings = getSettings();
    const appId = settings.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
    const secretKey = settings.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
    const env = settings.cashfreeEnvironment || 'PRODUCTION';

    if (!appId || !secretKey) {
      return res.status(400).json({ success: false, error: 'Cashfree keys not configured.' });
    }

    const { amount, customerName, customerPhone, customerEmail } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required.' });
    }

    const baseUrl = env === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const orderId = `order_${Date.now()}`;

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customerName || 'Customer',
          customer_phone: customerPhone || '9999999999',
          customer_email: customerEmail || 'customer@example.com',
        },
        order_meta: {
          return_url: `${process.env.APP_URL || req.protocol + '://' + req.get('host')}/payment-return?order_id={order_id}`,
          notify_url: `${process.env.APP_URL || req.protocol + '://' + req.get('host')}/api/cashfree/webhook`,
        },
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('[CASHFREE] create-order error:', data);
      return res.status(400).json({ success: false, error: data.message || 'Failed to create Cashfree order.' });
    }

    res.json({ success: true, orderId: data.order_id, paymentSessionId: data.payment_session_id, cfOrderData: data, appId, env });
  } catch (err: any) {
    console.error('[CASHFREE] create-order error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create Cashfree order.' });
  }
});

// Verify Cashfree payment
app.post('/api/cashfree/verify-payment', async (req, res) => {
  try {
    const settings = getSettings();
    const appId = settings.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
    const secretKey = settings.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
    const env = settings.cashfreeEnvironment || 'PRODUCTION';

    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: 'Order ID required.' });

    const baseUrl = env === 'PRODUCTION'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const response = await fetch(baseUrl, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    const data = await response.json() as any;

    if (data.order_status === 'PAID') {
      res.json({ success: true, status: 'PAID', orderId: data.order_id });
    } else {
      res.json({ success: false, status: data.order_status, message: 'Payment not completed.' });
    }
  } catch (err: any) {
    console.error('[CASHFREE] verify error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

// ─── CASHFREE WEBHOOK (auto payment confirmation) ────────────────────────────
app.post('/api/cashfree/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const payload = req.body.toString();
    const data = JSON.parse(payload);
    const orderId = data?.data?.order?.order_id;
    const paymentStatus = data?.data?.payment?.payment_status;
    console.log(`[CASHFREE WEBHOOK] Order: ${orderId}, Status: ${paymentStatus}`);
    // Payment confirmed — you can save order to DB here
    res.json({ success: true });
  } catch (err) {
    console.error('[CASHFREE WEBHOOK] error:', err);
    res.status(500).json({ success: false });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── CASHFREE PAYMENT RETURN HANDLER ─────────────────────────────────────────
// Cashfree redirects here after payment (success or failure)
app.get('/payment-return', async (req, res) => {
  const orderId = req.query.order_id as string;
  if (!orderId) {
    return res.redirect('/?payment=failed');
  }
  try {
    const settings = getSettings();
    const appId = settings.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
    const secretKey = settings.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
    const env = settings.cashfreeEnvironment || 'PRODUCTION';
    const baseUrl = env === 'PRODUCTION'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;
    const response = await fetch(baseUrl, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });
    const data = await response.json() as any;
    if (data.order_status === 'PAID') {
      return res.redirect(`/?payment=success&order_id=${orderId}`);
    } else {
      return res.redirect(`/?payment=failed&order_id=${orderId}`);
    }
  } catch (err) {
    return res.redirect('/?payment=failed');
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Vite Middleware integration for Full-Stack routing
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched successfully at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to bootstrap Full-Stack Express Server:', err);
});
