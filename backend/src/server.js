/**
 * Single backend for every MFE — no BFF layer.
 * Endpoints (API contracts):
 *   GET  /api/products            -> [{id,name,price,category,image,description}]
 *   GET  /api/products/:id
 *   GET  /api/search?q=...        -> filtered product list (title/category match)
 *   GET  /api/cart                -> current cart
 *   POST /api/cart                -> { productId, quantity } adds item
 *   DELETE /api/cart/:productId
 *   GET  /api/orders              -> orders for the (mock) logged-in user
 *   POST /api/orders              -> places order from current cart
 */
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // dev: all MFE ports (3000-3003, 4200) may call us
app.use(express.json());

const PRODUCTS = [
  { id: 1, name: "Aurora Desk Lamp", price: 49, category: "home", image: "https://picsum.photos/seed/lamp/400/300", description: "Warm-glow LED lamp with touch dimming." },
  { id: 2, name: "Nimbus Wireless Headphones", price: 129, category: "audio", image: "https://picsum.photos/seed/headphones/400/300", description: "Over-ear, 40h battery, active noise cancelling." },
  { id: 3, name: "Terra Ceramic Mug Set", price: 35, category: "home", image: "https://picsum.photos/seed/mugs/400/300", description: "Set of 4 hand-glazed stoneware mugs." },
  { id: 4, name: "Vertex Mechanical Keyboard", price: 89, category: "electronics", image: "https://picsum.photos/seed/keyboard/400/300", description: "75% layout, hot-swappable switches." },
  { id: 5, name: "Lumen Smart Bulb (2-pack)", price: 24, category: "home", image: "https://picsum.photos/seed/bulb/400/300", description: "16M colors, works offline via local hub." },
  { id: 6, name: "Drift Bluetooth Speaker", price: 59, category: "audio", image: "https://picsum.photos/seed/speaker/400/300", description: "IPX7 waterproof, 20h playtime." },
  { id: 7, name: "Slate Notebook A5", price: 18, category: "stationery", image: "https://picsum.photos/seed/notebook/400/300", description: "Dot grid, 160 pages, lays flat." },
  { id: 8, name: "Orbit USB-C Hub", price: 45, category: "electronics", image: "https://picsum.photos/seed/hub/400/300", description: "7-in-1: HDMI, 3x USB-A, SD, 100W PD." },
  { id: 9, name: "Cascade Pour-Over Kit", price: 72, category: "home", image: "https://picsum.photos/seed/coffee/400/300", description: "Glass dripper, carafe and filters included." },
  { id: 10, name: "Pixel Webcam 1080p", price: 55, category: "electronics", image: "https://picsum.photos/seed/webcam/400/300", description: "Auto-focus with hardware privacy shutter." },
  { id: 11, name: "Fern Linen Throw Blanket", price: 68, category: "home", image: "https://picsum.photos/seed/blanket/400/300", description: "Stonewashed linen, 130x170cm." },
  { id: 12, name: "Echo Studio Monitors (pair)", price: 199, category: "audio", image: "https://picsum.photos/seed/monitors/400/300", description: "5\" active near-field monitors." },
];

let cart = []; // [{productId, quantity}]
const orders = []; // [{id, items, total, placedAt}]

app.get("/api/products", (req, res) => res.json(PRODUCTS));

app.get("/api/products/:id", (req, res) => {
  const p = PRODUCTS.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "product not found" });
  res.json(p);
});

app.get("/api/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const category = String(req.query.category || "").toLowerCase();
  let results = PRODUCTS;
  if (q) {
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (category) results = results.filter((p) => p.category === category);
  res.json(results);
});

app.get("/api/cart", (req, res) => {
  const items = cart
    .map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.productId);
      return p ? { ...c, product: p } : null;
    })
    .filter(Boolean);
  res.json(items);
});

app.post("/api/cart", (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const p = PRODUCTS.find((x) => x.id === Number(productId));
  if (!p) return res.status(400).json({ error: "invalid productId" });
  const existing = cart.find((c) => c.productId === p.id);
  if (existing) existing.quantity += Number(quantity);
  else cart.push({ productId: p.id, quantity: Number(quantity) });
  res.status(201).json(cart);
});

app.delete("/api/cart/:productId", (req, res) => {
  cart = cart.filter((c) => c.productId !== Number(req.params.productId));
  res.json(cart);
});

app.get("/api/orders", (req, res) => res.json(orders));

app.post("/api/orders", (req, res) => {
  if (!cart.length) return res.status(400).json({ error: "cart is empty" });
  const items = cart.map((c) => {
    const p = PRODUCTS.find((x) => x.id === c.productId);
    return { productId: p.id, name: p.name, price: p.price, quantity: c.quantity };
  });
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = { id: orders.length + 1, items, total, placedAt: new Date().toISOString() };
  orders.push(order);
  cart = [];
  res.status(201).json(order);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[backend] http://localhost:${PORT}/api/products`));
