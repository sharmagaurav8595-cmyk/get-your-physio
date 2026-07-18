import { db } from "./database.mjs";

const email = String(process.argv[2] || "").trim().toLowerCase();
const name = String(process.argv[3] || "GetYourPhysio Admin").trim();

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error("Usage: npm run create-admin -- admin@example.com \"Admin Name\"");
  process.exit(1);
}

const existing = db.prepare("SELECT id, email, name FROM admins WHERE email = ?").get(email);

if (existing) {
  db.prepare("UPDATE admins SET name = ?, is_active = 1 WHERE id = ?").run(name, existing.id);
  console.info(`Admin already exists and is active: ${email}`);
} else {
  db.prepare("INSERT INTO admins (email, name, created_at) VALUES (?, ?, ?)").run(email, name, new Date().toISOString());
  console.info(`Admin created: ${email}`);
}

db.close();
