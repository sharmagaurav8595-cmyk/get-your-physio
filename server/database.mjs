import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const serverDir = dirname(fileURLToPath(import.meta.url));
export const dataDir = resolve(serverDir, "data");
export const uploadDir = resolve(serverDir, "uploads", "degrees");

mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadDir, { recursive: true });

export const db = new DatabaseSync(resolve(dataDir, "getyourphysio.sqlite"));
db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE,
    role TEXT NOT NULL CHECK (role IN ('physio', 'patient')),
    email_verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(email, role)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    mobile TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    landmark TEXT,
    latitude TEXT,
    longitude TEXT,
    qualification TEXT,
    degree TEXT,
    registration_number TEXT,
    degree_file_name TEXT,
    degree_file_path TEXT,
    credential_status TEXT DEFAULT 'pending',
    concern TEXT,
    preferred_care TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otp_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE,
    role TEXT NOT NULL,
    purpose TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    consumed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE,
    role TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    physio_user_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    concern TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(physio_user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_user_id INTEGER NOT NULL,
    physio_user_id INTEGER,
    physio_name TEXT,
    title TEXT NOT NULL,
    care_type TEXT,
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TEXT NOT NULL,
    FOREIGN KEY(patient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(physio_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_challenges(email, role, purpose, created_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
  CREATE INDEX IF NOT EXISTS idx_visits_physio ON visits(physio_user_id, scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_user_id, scheduled_at);
`);

const appointmentColumns = db.prepare("PRAGMA table_info(appointments)").all().map((column) => column.name);
if (!appointmentColumns.includes("physio_user_id")) {
  db.exec("ALTER TABLE appointments ADD COLUMN physio_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
}

db.exec("CREATE INDEX IF NOT EXISTS idx_appointments_physio ON appointments(physio_user_id, scheduled_at)");
db.exec(`
  UPDATE appointments
  SET physio_user_id = (
    SELECT u.id
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.role = 'physio' AND LOWER(p.name) = LOWER(appointments.physio_name)
    LIMIT 1
  )
  WHERE physio_user_id IS NULL AND TRIM(COALESCE(physio_name, '')) <> ''
`);

export function transaction(callback) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function cleanupExpiredRecords() {
  const now = new Date().toISOString();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM otp_challenges WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM verification_tokens WHERE expires_at < ? OR consumed_at IS NOT NULL").run(now);
}
