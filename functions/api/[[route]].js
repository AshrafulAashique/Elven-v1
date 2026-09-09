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

async function readDB(env) {
  if (env.ELVEN_KV) {
    const data = await env.ELVEN_KV.get('elven_db', 'json');
    if (data) {
      if (!data.users) data.users = [];
      return data;
    }
  } else if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${env.KV_REST_API_URL}/get/elven_db`, {
        headers: { Authorization: `Bearer ${env.KV_REST_API_TOKEN}` }
      });
      const data = await res.json();
      if (data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (!parsed.users) parsed.users = [];
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.parse(JSON.stringify(defaultDB));
}

async function writeDB(env, data) {
  if (env.ELVEN_KV) {
    await env.ELVEN_KV.put('elven_db', JSON.stringify(data));
  } else if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    await fetch(`${env.KV_REST_API_URL}/set/elven_db`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.KV_REST_API_TOKEN}` },
      body: JSON.stringify(data)
    });
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function generateToken(userId) {
  return btoa(`token_${userId}_${Date.now()}`);
}

async function requireAuth(request, db) {
  const auth = request.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const decodedStr = atob(token);
    const [_, userId] = decodedStr.split('_');
    const user = db.users.find(u => u.id === userId);
    return user || null;
  } catch(e) {
    return null;
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    if (path === '/api/products') {
      if (method === 'GET') {
        const db = await readDB(env);
        return jsonResponse(db.products || []);
      }
      if (method === 'POST') {
        const body = await request.json();
        const db = await readDB(env);
        db.products = body;
        await writeDB(env, db);
        return jsonResponse({ success: true });
      }
    }

    if (path === '/api/categories') {
      if (method === 'GET') {
        const db = await readDB(env);
        return jsonResponse(db.categories || []);
      }
      if (method === 'POST') {
        const body = await request.json();
        const db = await readDB(env);
        db.categories = body;
        await writeDB(env, db);
        return jsonResponse({ success: true });
      }
    }

    if (path === '/api/headers') {
      if (method === 'GET') {
        const db = await readDB(env);
        return jsonResponse(db.headers || {});
      }
      if (method === 'POST') {
        const body = await request.json();
        const db = await readDB(env);
        db.headers = body;
        await writeDB(env, db);
        return jsonResponse({ success: true });
      }
    }

    if (path === '/api/auth/register' && method === 'POST') {
      const { name, email, password } = await request.json();
      if (!name || !email || !password) return jsonResponse({ error: 'Missing fields' }, 400);
      
      const db = await readDB(env);
      if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return jsonResponse({ error: 'Email already exists' }, 400);
      }

      const newUser = {
        id: crypto.randomUUID(),
        name, email, password, wishlist: []
      };

      db.users.push(newUser);
      await writeDB(env, db);
      
      const token = generateToken(newUser.id);
      return jsonResponse({ token, user: { name: newUser.name, email: newUser.email, wishlist: newUser.wishlist } });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = await request.json();
      const db = await readDB(env);
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) return jsonResponse({ error: 'Invalid email or password' }, 401);
      
      const token = generateToken(user.id);
      return jsonResponse({ token, user: { name: user.name, email: user.email, wishlist: user.wishlist } });
    }

    if (path === '/api/user' && method === 'GET') {
      const db = await readDB(env);
      const user = await requireAuth(request, db);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
      return jsonResponse({ name: user.name, email: user.email, wishlist: user.wishlist || [] });
    }

    if (path === '/api/user/wishlist' && method === 'POST') {
      const { productId } = await request.json();
      if (!productId) return jsonResponse({ error: 'No productId provided' }, 400);
      
      const db = await readDB(env);
      const user = await requireAuth(request, db);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
      
      const userIndex = db.users.findIndex(u => u.id === user.id);
      if (!db.users[userIndex].wishlist) db.users[userIndex].wishlist = [];
      
      const idx = db.users[userIndex].wishlist.indexOf(productId);
      if (idx > -1) {
        db.users[userIndex].wishlist.splice(idx, 1);
      } else {
        db.users[userIndex].wishlist.push(productId);
      }
      
      await writeDB(env, db);
      return jsonResponse({ wishlist: db.users[userIndex].wishlist });
    }

    return new Response('Not Found', { status: 404 });
  } catch(e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
