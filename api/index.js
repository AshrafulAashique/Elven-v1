const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize Redis only if Vercel KV env vars are present
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const defaultDB = {
  products: [],
  categories: ["Necklaces", "Earrings", "Bracelets", "Rings", "Handbags", "Accessories"],
  headers: {
    heroTagline: "the india edit — jewellery & bags",
    heroTitle: "Unwrap <em>everyday</em><br>luxury",
    heroSub: "Fine-finished jewellery and handbags, designed in-house and priced from ₹399. Keep scrolling.",
    featuredTitle: "Featured",
    bestsellerTitle: "Best Sellers",
    trendingTitle: "Trending Now",
    jewelleryTitle: "Jewellery",
    handbagsTitle: "Handbags",
    footerTagline: "Fine-finished jewellery and handbags for the modern Indian woman. Designed in-house, priced from ₹399."
  },
  users: []
};

// Async DB Reader
async function readDB() {
  if (!redis) {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
      return defaultDB;
    }
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data.users) data.users = [];
      return data;
    } catch(e) {
      return defaultDB;
    }
  }
  try {
    const data = await redis.get('elven_db');
    if (!data) return defaultDB;
    // Upstash returns objects directly if it was stored as JSON
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch(e) {
    console.error("KV Read Error", e);
    return defaultDB;
  }
}

// Async DB Writer
async function writeDB(data) {
  if (redis) {
    await redis.set('elven_db', data);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }
}

/* ---------------- API ROUTES ---------------- */

// Products
app.get('/api/products', async (req, res) => {
  const db = await readDB();
  res.json(db.products || []);
});
app.post('/api/products', async (req, res) => {
  const db = await readDB();
  db.products = req.body;
  await writeDB(db);
  res.json({ success: true });
});

// Categories
app.get('/api/categories', async (req, res) => {
  const db = await readDB();
  res.json(db.categories || []);
});
app.post('/api/categories', async (req, res) => {
  const db = await readDB();
  db.categories = req.body;
  await writeDB(db);
  res.json({ success: true });
});

// Headers
app.get('/api/headers', async (req, res) => {
  const db = await readDB();
  res.json(db.headers || {});
});
app.post('/api/headers', async (req, res) => {
  const db = await readDB();
  db.headers = req.body;
  await writeDB(db);
  res.json({ success: true });
});

/* ---------------- CUSTOMER AUTH ---------------- */

function generateToken(userId) {
  return Buffer.from(`token_${userId}_${Date.now()}`).toString('base64');
}

// Async Middleware for Auth
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace('Bearer ', '');
  try {
    const decodedStr = Buffer.from(token, 'base64').toString('utf8');
    const [_, userId] = decodedStr.split('_');
    
    const db = await readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  const db = await readDB();
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password, 
    wishlist: []
  };

  db.users.push(newUser);
  await writeDB(db);
  
  const token = generateToken(newUser.id);
  res.json({ token, user: { name: newUser.name, email: newUser.email, wishlist: newUser.wishlist } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const db = await readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  
  const token = generateToken(user.id);
  res.json({ token, user: { name: user.name, email: user.email, wishlist: user.wishlist } });
});

// Get profile
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email, wishlist: req.user.wishlist || [] });
});

// Toggle wishlist item
app.post('/api/user/wishlist', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'No productId provided' });
  
  const db = await readDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(401).json({ error: 'User not found' });
  
  const user = db.users[userIndex];
  if (!user.wishlist) user.wishlist = [];
  
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  
  await writeDB(db);
  res.json({ wishlist: user.wishlist });
});

// Export the Express app for Vercel Serverless
module.exports = app;
