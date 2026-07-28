import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  closeDatabase,
  collections,
  connectDatabase,
  getDegreeBucket,
} from "./database.mjs";

const sqlitePath = resolve(process.env.SQLITE_MIGRATION_PATH || "server/data/getyourphysio.sqlite");
const source = new DatabaseSync(sqlitePath, { readOnly: true });
const inserted = [];
const uploadedFiles = [];

const asDate = (value, fallback = new Date()) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const nullableDate = (value) => value ? asDate(value) : null;

function track(collection, result) {
  inserted.push({ collection, id: result.insertedId });
  return result.insertedId;
}

function uploadDegreeFile(buffer, filename, userId) {
  return new Promise((resolveUpload, rejectUpload) => {
    const stream = getDegreeBucket().openUploadStream(filename || "degree-document.pdf", {
      contentType: "application/pdf",
      metadata: { userId, purpose: "physio-degree", migratedFrom: "sqlite" },
    });
    stream.on("error", rejectUpload);
    stream.on("finish", () => resolveUpload(stream.id));
    stream.end(buffer);
  });
}

async function ensureEmptyTarget() {
  const counts = await Promise.all(
    Object.values(collections).map((collection) => collection.countDocuments()),
  );
  if (counts.some((count) => count > 0)) {
    throw new Error(
      "MongoDB target is not empty. Migration stopped to avoid duplicate or overwritten data.",
    );
  }
}

async function rollback() {
  await Promise.allSettled(uploadedFiles.map((fileId) => getDegreeBucket().delete(fileId)));
  await Promise.allSettled(
    inserted.reverse().map(({ collection, id }) => collection.deleteOne({ _id: id })),
  );
}

try {
  if (!existsSync(sqlitePath)) throw new Error(`SQLite database not found: ${sqlitePath}`);
  await connectDatabase();
  await ensureEmptyTarget();

  const userIdMap = new Map();
  const adminIdMap = new Map();

  for (const row of source.prepare("SELECT * FROM users ORDER BY id").all()) {
    const id = track(collections.users, await collections.users.insertOne({
      email: row.email.toLowerCase(),
      role: row.role,
      emailVerifiedAt: asDate(row.email_verified_at),
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
    userIdMap.set(row.id, id);
  }

  for (const row of source.prepare("SELECT * FROM admins ORDER BY id").all()) {
    const id = track(collections.admins, await collections.admins.insertOne({
      email: row.email.toLowerCase(),
      name: row.name,
      isActive: Boolean(row.is_active),
      createdAt: asDate(row.created_at),
      updatedAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
    adminIdMap.set(row.id, id);
  }

  for (const row of source.prepare("SELECT * FROM profiles ORDER BY user_id").all()) {
    const userId = userIdMap.get(row.user_id);
    if (!userId) continue;
    let degreeFileId = null;
    if (row.degree_file_path && existsSync(row.degree_file_path)) {
      degreeFileId = await uploadDegreeFile(
        readFileSync(row.degree_file_path),
        row.degree_file_name,
        userId,
      );
      uploadedFiles.push(degreeFileId);
    }
    track(collections.profiles, await collections.profiles.insertOne({
      userId,
      name: row.name,
      age: row.age || "",
      gender: row.gender || "",
      mobile: row.mobile || "",
      address: row.address || "",
      city: row.city || "",
      state: row.state || "",
      pincode: row.pincode || "",
      landmark: row.landmark || "",
      latitude: row.latitude || "",
      longitude: row.longitude || "",
      qualification: row.qualification || "",
      degree: row.degree || "",
      registrationNumber: row.registration_number || "",
      degreeFileId,
      degreeFileName: degreeFileId ? row.degree_file_name || "degree-document.pdf" : "",
      credentialStatus: row.credential_status || "pending",
      concern: row.concern || "",
      preferredCare: row.preferred_care || "",
      updatedAt: asDate(row.updated_at),
      migratedFromSqliteUserId: row.user_id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM otp_challenges ORDER BY id").all()) {
    if (asDate(row.expires_at) <= new Date()) continue;
    track(collections.otpChallenges, await collections.otpChallenges.insertOne({
      email: row.email.toLowerCase(),
      role: row.role,
      purpose: row.purpose,
      codeHash: row.code_hash,
      expiresAt: asDate(row.expires_at),
      attempts: row.attempts || 0,
      consumedAt: nullableDate(row.consumed_at),
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM verification_tokens ORDER BY id").all()) {
    if (asDate(row.expires_at) <= new Date()) continue;
    track(collections.verificationTokens, await collections.verificationTokens.insertOne({
      email: row.email.toLowerCase(),
      role: row.role,
      tokenHash: row.token_hash,
      expiresAt: asDate(row.expires_at),
      consumedAt: nullableDate(row.consumed_at),
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM sessions ORDER BY id").all()) {
    const userId = userIdMap.get(row.user_id);
    if (!userId || asDate(row.expires_at) <= new Date()) continue;
    track(collections.sessions, await collections.sessions.insertOne({
      userId,
      tokenHash: row.token_hash,
      expiresAt: asDate(row.expires_at),
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM admin_sessions ORDER BY id").all()) {
    const adminId = adminIdMap.get(row.admin_id);
    if (!adminId || asDate(row.expires_at) <= new Date()) continue;
    track(collections.adminSessions, await collections.adminSessions.insertOne({
      adminId,
      tokenHash: row.token_hash,
      expiresAt: asDate(row.expires_at),
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM visits ORDER BY id").all()) {
    const physioUserId = userIdMap.get(row.physio_user_id);
    if (!physioUserId) continue;
    track(collections.visits, await collections.visits.insertOne({
      physioUserId,
      patientName: row.patient_name,
      patientEmail: row.patient_email || "",
      concern: row.concern,
      scheduledAt: asDate(row.scheduled_at),
      status: row.status || "upcoming",
      notes: row.notes || "",
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  for (const row of source.prepare("SELECT * FROM appointments ORDER BY id").all()) {
    const patientUserId = userIdMap.get(row.patient_user_id);
    if (!patientUserId) continue;
    track(collections.appointments, await collections.appointments.insertOne({
      patientUserId,
      physioUserId: row.physio_user_id ? userIdMap.get(row.physio_user_id) || null : null,
      physioName: row.physio_name || "",
      title: row.title,
      careType: row.care_type || "",
      scheduledAt: asDate(row.scheduled_at),
      status: row.status,
      createdAt: asDate(row.created_at),
      migratedFromSqliteId: row.id,
    }));
  }

  console.info(
    `Migration complete: ${userIdMap.size} users, ${adminIdMap.size} Admins, `
    + `${uploadedFiles.length} GridFS degree document(s).`,
  );
} catch (error) {
  await rollback();
  console.error(`Migration failed and inserted MongoDB records were rolled back: ${error.message}`);
  process.exitCode = 1;
} finally {
  source.close();
  await closeDatabase();
}
