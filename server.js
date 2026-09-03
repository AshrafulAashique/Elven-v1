const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname)); // Serve static files

// Default DB schema
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
  users: [] // { id, name, email, password, wishlist: [] }
};

// Initialize DB if not exists
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch(e) {
    return defaultDB;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Ensure DB has minimum schema fields on boot
let db = readDB();
if (!db.users) db.users = [];
writeDB(db);

/* ---------------- API ROUTES ---------------- */

// Products
app.get('/api/products', (req, res) => res.json(db.products));
app.post('/api/products', (req, res) => {
  db.products = req.body;
  writeDB(db);
  res.json({ success: true });
});

// Categories
app.get('/api/categories', (req, res) => res.json(db.categories));
app.post('/api/categories', (req, res) => {
  db.categories = req.body;
  writeDB(db);
  res.json({ success: true });
});

// Headers
app.get('/api/headers', (req, res) => res.json(db.headers));
app.post('/api/headers', (req, res) => {
  db.headers = req.body;
  writeDB(db);
  res.json({ success: true });
});

/* ---------------- CUSTOMER AUTH ---------------- */

// Basic token generator
function generateToken(userId) {
  return Buffer.from(`token_${userId}_${Date.now()}`).toString('base64');
}

// Middleware to get user from token
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace('Bearer ', '');
  try {
    const decodedStr = Buffer.from(token, 'base64').toString('utf8');
    const [_, userId] = decodedStr.split('_');
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
}

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password, // Store as plaintext for simple local demo per requirements
    wishlist: []
  };

  db.users.push(newUser);
  writeDB(db);
  
  const token = generateToken(newUser.id);
  res.json({ token, user: { name: newUser.name, email: newUser.email, wishlist: newUser.wishlist } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
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
app.post('/api/user/wishlist', requireAuth, (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'No productId provided' });
  
  if (!req.user.wishlist) req.user.wishlist = [];
  
  const index = req.user.wishlist.indexOf(productId);
  if (index > -1) {
    req.user.wishlist.splice(index, 1); // Remove
  } else {
    req.user.wishlist.push(productId); // Add
  }
  
  writeDB(db);
  res.json({ wishlist: req.user.wishlist });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌟 ELVEN SERVER RUNNING`);
  console.log(`🌐 Storefront: http://localhost:${PORT}/index.html`);
  console.log(`🔒 Admin Panel: http://localhost:${PORT}/shop-admin.html`);
  console.log(`======================================================\n`);
});
