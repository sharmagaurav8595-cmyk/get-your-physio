import "dotenv/config";
import { closeDatabase, collections, connectDatabase } from "./database.mjs";

const email = String(process.argv[2] || "").trim().toLowerCase();
const name = String(process.argv[3] || "GetYourPhysio Admin").trim();

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error("Usage: npm run create-admin -- admin@example.com \"Admin Name\"");
  process.exit(1);
}

try {
  await connectDatabase();
  const existing = await collections.admins.findOne({ email });

  if (existing) {
    await collections.admins.updateOne(
      { _id: existing._id },
      { $set: { name, isActive: true, updatedAt: new Date() } },
    );
    console.info(`Admin already exists and is active: ${email}`);
  } else {
    await collections.admins.insertOne({
      email,
      name,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.info(`Admin created: ${email}`);
  }
} finally {
  await closeDatabase();
}
