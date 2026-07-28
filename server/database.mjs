import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DB_NAME || "getyourphysio";

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5_000,
});

let database;
let degreeBucket;
let connected = false;

export const collections = {};

export async function connectDatabase() {
  if (connected) return database;

  await client.connect();
  database = client.db(databaseName);

  Object.assign(collections, {
    users: database.collection("users"),
    admins: database.collection("admins"),
    profiles: database.collection("profiles"),
    otpChallenges: database.collection("otpChallenges"),
    verificationTokens: database.collection("verificationTokens"),
    sessions: database.collection("sessions"),
    adminSessions: database.collection("adminSessions"),
    visits: database.collection("visits"),
    appointments: database.collection("appointments"),
  });

  degreeBucket = new GridFSBucket(database, { bucketName: "degree_documents" });

  await Promise.all([
    collections.users.createIndex({ email: 1, role: 1 }, { unique: true }),
    collections.admins.createIndex({ email: 1 }, { unique: true }),
    collections.profiles.createIndex({ userId: 1 }, { unique: true }),
    collections.profiles.createIndex({ credentialStatus: 1 }),
    collections.otpChallenges.createIndex({ email: 1, role: 1, purpose: 1, createdAt: -1 }),
    collections.otpChallenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.verificationTokens.createIndex({ tokenHash: 1 }, { unique: true }),
    collections.verificationTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    collections.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.adminSessions.createIndex({ tokenHash: 1 }, { unique: true }),
    collections.adminSessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.visits.createIndex({ physioUserId: 1, scheduledAt: -1 }),
    collections.appointments.createIndex({ patientUserId: 1, scheduledAt: 1 }),
    collections.appointments.createIndex({ physioUserId: 1, scheduledAt: 1 }),
  ]);

  await database.command({ ping: 1 });
  connected = true;
  console.info(`Connected to MongoDB database "${databaseName}".`);
  return database;
}

export function getDegreeBucket() {
  if (!degreeBucket) throw new Error("MongoDB is not connected.");
  return degreeBucket;
}

export function toObjectId(value) {
  if (value instanceof ObjectId) return value;
  if (!ObjectId.isValid(String(value || ""))) return null;
  return new ObjectId(String(value));
}

export async function closeDatabase() {
  connected = false;
  await client.close();
}

export { ObjectId };
