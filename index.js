// index.js (Replit)
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
app.use(express.json());

const DB = process.env.FIREBASE_DB_URL;

app.post("/register", async (req, res) => {
  const { username } = req.body;
  const key = Math.random().toString(36).substr(2, 10).toUpperCase();

  await fetch(`${DB}.json`, {
    method: "POST",
    body: JSON.stringify({ username, key, created: Date.now() })
  });

  res.json({ success: true, key });
});

app.post("/verify", async (req, res) => {
  const { key } = req.body;
  const r = await fetch(`${DB}.json`);
  const data = await r.json();

  const now = Date.now();
  const found = Object.values(data || {}).find(k => k.key === key);

  if (found) {
    const age = now - found.created;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms

    if (age > maxAge) {
      return res.json({ success: false, message: "Key expired" });
    }

    return res.json({ success: true, username: found.username });
  }

  res.json({ success: false, message: "Invalid key" });
});

app.listen(3000, () => console.log("Running"));
