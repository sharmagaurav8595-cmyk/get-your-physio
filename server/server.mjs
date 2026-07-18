import "dotenv/config";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { extname, resolve } from "node:path";
import express from "express";
import multer from "multer";
import { cleanupExpiredRecords, db, transaction, uploadDir } from "./database.mjs";
import { sendOtpEmail } from "./mailer.mjs";

const app = express();
const port = Number(process.env.API_PORT || 8787);
const production = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const hash = (value) => createHash("sha256").update(value).digest("hex");
const normalizeEmail = (value = "") => String(value).trim().toLowerCase();
const nowIso = () => new Date().toISOString();
const futureIso = (milliseconds) => new Date(Date.now() + milliseconds).toISOString();
const validAccountRole = (role) => role === "physio" || role === "patient";
const validLoginRole = (role) => validAccountRole(role) || role === "admin";

function apiError(status, message, code = "REQUEST_FAILED") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function issueSession(userId) {
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(userId, hash(token), futureIso(30 * 24 * 60 * 60 * 1000), nowIso());
  return token;
}

function issueAdminSession(adminId) {
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO admin_sessions (admin_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(adminId, hash(token), futureIso(12 * 60 * 60 * 1000), nowIso());
  return token;
}

function serializeProfile(row) {
  return {
    id: row.id,
    role: row.role,
    email: row.email,
    name: row.name,
    age: row.age || "",
    gender: row.gender || "",
    mobile: row.mobile || "",
    address: row.address || "",
    city: row.city || "",
    state: row.state || "",
    pincode: row.pincode || "",
    landmark: row.landmark || "",
    location: row.latitude && row.longitude ? { lat: row.latitude, lng: row.longitude } : null,
    qualification: row.qualification || "",
    degree: row.degree || "",
    registrationNumber: row.registration_number || "",
    degreeFile: row.degree_file_name || "",
    credentialStatus: row.credential_status || "",
    concern: row.concern || "",
    preferredCare: row.preferred_care || "",
  };
}

function findFullUser(userId) {
  return db.prepare(`
    SELECT u.id, u.email, u.role, u.email_verified_at, u.created_at,
      p.name, p.age, p.gender, p.mobile, p.address, p.city, p.state, p.pincode,
      p.landmark, p.latitude, p.longitude, p.qualification, p.degree,
      p.registration_number, p.degree_file_name, p.credential_status,
      p.concern, p.preferred_care
    FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = ?
  `).get(userId);
}

function requireAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(apiError(401, "Please log in to continue.", "AUTH_REQUIRED"));
  const session = db.prepare(`
    SELECT s.id AS session_id, s.user_id, u.role
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(hash(token), nowIso());
  if (!session) return next(apiError(401, "Your session has expired. Please log in again.", "SESSION_EXPIRED"));
  req.auth = { ...session, token };
  next();
}

function requireAdmin(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(apiError(401, "Admin login is required.", "ADMIN_AUTH_REQUIRED"));
  const session = db.prepare(`
    SELECT s.id AS session_id, s.admin_id, a.email, a.name
    FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND a.is_active = 1
  `).get(hash(token), nowIso());
  if (!session) return next(apiError(401, "Your Admin session has expired.", "ADMIN_SESSION_EXPIRED"));
  req.admin = { ...session, token };
  next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase() || ".pdf"}`),
});
const degreeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === "application/pdf" || extname(file.originalname).toLowerCase() === ".pdf";
    callback(isPdf ? null : apiError(400, "Degree document must be a PDF."), isPdf);
  },
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "getyourphysio-api", emailMode: process.env.SMTP_HOST ? "smtp" : "development" });
});

app.post("/api/auth/request-otp", async (req, res, next) => {
  try {
    cleanupExpiredRecords();
    const email = normalizeEmail(req.body.email);
    const { role, purpose } = req.body;
    if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, "Enter a valid email address.");
    if (!validLoginRole(role)) throw apiError(400, "Choose a valid account type.");
    if (purpose !== "login" && purpose !== "registration") throw apiError(400, "Invalid OTP purpose.");

    if (role === "admin" && purpose !== "login") throw apiError(403, "Admin accounts can only be created from the server command.");

    const user = role === "admin"
      ? db.prepare("SELECT id FROM admins WHERE email = ? AND is_active = 1").get(email)
      : db.prepare("SELECT id FROM users WHERE email = ? AND role = ?").get(email, role);
    if (purpose === "login" && !user) throw apiError(404, "No account was found. Please sign up first.", "ACCOUNT_NOT_FOUND");
    if (purpose === "registration" && user) throw apiError(409, "An account already exists. Please log in instead.", "ACCOUNT_EXISTS");

    const recent = db.prepare("SELECT created_at FROM otp_challenges WHERE email = ? AND role = ? AND purpose = ? ORDER BY id DESC LIMIT 1").get(email, role, purpose);
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 30_000) {
      throw apiError(429, "Please wait 30 seconds before requesting another code.", "OTP_RATE_LIMIT");
    }

    const otp = String(randomInt(100000, 1000000));
    const challenge = db.prepare("INSERT INTO otp_challenges (email, role, purpose, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(email, role, purpose, hash(otp), futureIso(10 * 60 * 1000), nowIso());
    let delivery;
    try {
      delivery = await sendOtpEmail({ email, otp, purpose });
    } catch (deliveryError) {
      db.prepare("DELETE FROM otp_challenges WHERE id = ?").run(challenge.lastInsertRowid);
      console.error("OTP email delivery failed:", deliveryError.message);
      throw apiError(502, "We could not send the OTP email. Check the SMTP settings and try again.", "OTP_DELIVERY_FAILED");
    }
    res.status(201).json({
      message: delivery.delivered ? `OTP sent to ${delivery.recipient}.` : "Development OTP created.",
      deliveryMode: delivery.mode,
      recipient: delivery.recipient,
      ...(production || delivery.delivered ? {} : { developmentOtp: otp }),
    });
  } catch (error) { next(error); }
});

app.post("/api/auth/verify-otp", (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { role, purpose, otp } = req.body;
    const challenge = db.prepare(`
      SELECT * FROM otp_challenges
      WHERE email = ? AND role = ? AND purpose = ? AND consumed_at IS NULL
      ORDER BY id DESC LIMIT 1
    `).get(email, role, purpose);
    if (!challenge || challenge.expires_at < nowIso()) throw apiError(400, "This OTP has expired. Request a new one.", "OTP_EXPIRED");
    if (challenge.attempts >= 5) throw apiError(429, "Too many incorrect attempts. Request a new OTP.", "OTP_LOCKED");
    if (hash(String(otp || "")) !== challenge.code_hash) {
      db.prepare("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?").run(challenge.id);
      throw apiError(400, "The OTP you entered is incorrect.", "OTP_INCORRECT");
    }
    db.prepare("UPDATE otp_challenges SET consumed_at = ? WHERE id = ?").run(nowIso(), challenge.id);

    if (purpose === "login") {
      if (role === "admin") {
        const admin = db.prepare("SELECT id, email, name FROM admins WHERE email = ? AND is_active = 1").get(email);
        if (!admin) throw apiError(404, "Admin account not found.", "ACCOUNT_NOT_FOUND");
        const token = issueAdminSession(admin.id);
        return res.json({ token, user: { id: admin.id, email: admin.email, name: admin.name, role: "admin" } });
      }
      const user = db.prepare("SELECT id FROM users WHERE email = ? AND role = ?").get(email, role);
      if (!user) throw apiError(404, "Account not found.", "ACCOUNT_NOT_FOUND");
      const token = issueSession(user.id);
      return res.json({ token, user: serializeProfile(findFullUser(user.id)) });
    }

    const verificationToken = randomBytes(32).toString("base64url");
    db.prepare("INSERT INTO verification_tokens (email, role, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(email, role, hash(verificationToken), futureIso(30 * 60 * 1000), nowIso());
    res.json({ verificationToken });
  } catch (error) { next(error); }
});

app.post("/api/auth/register", degreeUpload.single("degreeFile"), (req, res, next) => {
  try {
    const role = req.body.role;
    const verificationToken = req.body.verificationToken;
    const profile = JSON.parse(req.body.profile || "{}");
    const email = normalizeEmail(profile.email);
    if (!validAccountRole(role)) throw apiError(400, "Invalid account type.");
    const commonRequired = [profile.name, profile.age, profile.gender, profile.mobile, email, profile.address, profile.city];
    if (commonRequired.some((value) => !String(value || "").trim())) throw apiError(400, "Complete all required personal and address details.");
    if (!/^\+?[0-9\s-]{7,18}$/.test(profile.mobile)) throw apiError(400, "Enter a valid mobile number.");
    if (role === "patient" && !String(profile.concern || "").trim()) throw apiError(400, "Tell us what you would like help with.");
    if (role === "physio" && (!profile.state || !profile.pincode || !profile.qualification || !profile.degree || !profile.registrationNumber || !req.file)) {
      throw apiError(400, "Complete all practice and qualification details and upload the degree PDF.");
    }
    if (req.file && readFileSync(req.file.path, { encoding: "utf8", flag: "r" }).slice(0, 5) !== "%PDF-") {
      throw apiError(400, "The uploaded degree document is not a valid PDF.");
    }
    const proof = db.prepare(`
      SELECT * FROM verification_tokens
      WHERE email = ? AND role = ? AND token_hash = ? AND consumed_at IS NULL AND expires_at > ?
    `).get(email, role, hash(String(verificationToken || "")), nowIso());
    if (!proof) throw apiError(400, "Email verification is missing or expired.", "EMAIL_NOT_VERIFIED");
    if (db.prepare("SELECT id FROM users WHERE email = ? AND role = ?").get(email, role)) throw apiError(409, "This account already exists.");

    const userId = transaction(() => {
      const createdAt = nowIso();
      const user = db.prepare("INSERT INTO users (email, role, email_verified_at, created_at) VALUES (?, ?, ?, ?)")
        .run(email, role, createdAt, createdAt);
      db.prepare(`
        INSERT INTO profiles (
          user_id, name, age, gender, mobile, address, city, state, pincode, landmark,
          latitude, longitude, qualification, degree, registration_number,
          degree_file_name, degree_file_path, credential_status, concern, preferred_care, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.lastInsertRowid, profile.name, profile.age || "", profile.gender || "", profile.mobile,
        profile.address || "", profile.city || "", profile.state || "", profile.pincode || "", profile.landmark || "",
        profile.location?.lat || "", profile.location?.lng || "", profile.qualification || "", profile.degree || "",
        profile.registrationNumber || "", req.file?.originalname || "", req.file?.path || "",
        role === "physio" ? "pending" : "not_applicable", profile.concern || "", profile.preferredCare || "", createdAt,
      );
      db.prepare("UPDATE verification_tokens SET consumed_at = ? WHERE id = ?").run(createdAt, proof.id);
      return Number(user.lastInsertRowid);
    });

    const token = issueSession(userId);
    res.status(201).json({ token, user: serializeProfile(findFullUser(userId)) });
  } catch (error) {
    if (req.file?.path && existsSync(req.file.path)) unlinkSync(req.file.path);
    next(error);
  }
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(req.auth.session_id);
  res.status(204).end();
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM admin_sessions WHERE id = ?").run(req.admin.session_id);
  res.status(204).end();
});

app.get("/api/admin/overview", requireAdmin, (req, res, next) => {
  try {
    const location = String(req.query.location || "").trim().toLowerCase();
    const status = String(req.query.status || "all").trim().toLowerCase();
    const includesLocation = (row) => !location || [row.city, row.state, row.address, row.pincode].some((value) => String(value || "").toLowerCase().includes(location));

    const patients = db.prepare(`
      SELECT u.id, u.email, u.created_at, p.name, p.age, p.gender, p.mobile, p.address, p.city, p.state,
        p.pincode, p.concern, p.preferred_care,
        (SELECT COUNT(1) FROM appointments a WHERE a.patient_user_id = u.id) AS appointment_count
      FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'patient' ORDER BY u.created_at DESC
    `).all().filter(includesLocation);

    const physios = db.prepare(`
      SELECT u.id, u.email, u.created_at, p.name, p.mobile, p.address, p.city, p.state, p.pincode,
        p.qualification, p.degree, p.registration_number, p.credential_status,
        (SELECT COUNT(1) FROM appointments a WHERE a.physio_user_id = u.id) AS booking_count
      FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'physio' ORDER BY u.created_at DESC
    `).all().filter(includesLocation);

    const bookings = db.prepare(`
      SELECT a.id, a.title, a.physio_user_id,
        COALESCE(assigned_profile.name, a.physio_name) AS physio_name,
        a.care_type, a.scheduled_at, a.status, a.created_at,
        u.email AS patient_email, p.name AS patient_name, p.mobile AS patient_mobile,
        p.address, p.city, p.state, p.pincode, p.concern
      FROM appointments a
      JOIN users u ON u.id = a.patient_user_id
      JOIN profiles p ON p.user_id = u.id
      LEFT JOIN users assigned_user ON assigned_user.id = a.physio_user_id AND assigned_user.role = 'physio'
      LEFT JOIN profiles assigned_profile ON assigned_profile.user_id = assigned_user.id
      ORDER BY a.created_at DESC
    `).all().filter((booking) => includesLocation(booking) && (status === "all" || booking.status.toLowerCase() === status));

    const patientOptions = db.prepare(`
      SELECT u.id, u.email, p.name, p.mobile, p.city, p.state
      FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'patient' ORDER BY p.name COLLATE NOCASE
    `).all();
    const physioOptions = db.prepare(`
      SELECT u.id, u.email, p.name, p.mobile, p.city, p.state, p.credential_status
      FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'physio' ORDER BY p.name COLLATE NOCASE
    `).all();

    const allPatientCount = db.prepare("SELECT COUNT(1) AS count FROM users WHERE role = 'patient'").get().count;
    const allPhysioCount = db.prepare("SELECT COUNT(1) AS count FROM users WHERE role = 'physio'").get().count;
    const allBookingCount = db.prepare("SELECT COUNT(1) AS count FROM appointments").get().count;
    const pendingCredentials = db.prepare("SELECT COUNT(1) AS count FROM profiles p JOIN users u ON u.id = p.user_id WHERE u.role = 'physio' AND p.credential_status = 'pending'").get().count;

    res.json({
      admin: { id: req.admin.admin_id, name: req.admin.name, email: req.admin.email, role: "admin" },
      stats: { patients: allPatientCount, physios: allPhysioCount, bookings: allBookingCount, pendingCredentials },
      filters: { location, status },
      patients,
      physios,
      bookings,
      patientOptions,
      physioOptions,
    });
  } catch (error) { next(error); }
});

app.post("/api/admin/appointments", requireAdmin, (req, res, next) => {
  try {
    const patientUserId = Number(req.body.patientUserId);
    const physioUserId = Number(req.body.physioUserId);
    const careType = String(req.body.careType || "");
    const allowedCareTypes = ["Home visit", "Online consultation"];
    const allowedStatuses = ["requested", "confirmed", "completed", "cancelled"];
    const status = String(req.body.status || "confirmed").toLowerCase();
    if (!patientUserId) throw apiError(400, "Choose a patient.");
    if (!physioUserId) throw apiError(400, "Choose a Physio to assign.");
    if (!allowedCareTypes.includes(careType)) throw apiError(400, "Choose Home visit or Online consultation.");
    if (!allowedStatuses.includes(status)) throw apiError(400, "Invalid appointment status.");
    const scheduledAt = new Date(req.body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) throw apiError(400, "Enter a valid booking date and time.");

    const patient = db.prepare(`
      SELECT u.id, p.name FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ? AND u.role = 'patient'
    `).get(patientUserId);
    if (!patient) throw apiError(404, "Patient account not found.");
    const physio = db.prepare(`
      SELECT u.id, p.name FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ? AND u.role = 'physio'
    `).get(physioUserId);
    if (!physio) throw apiError(404, "Physio account not found.");

    const title = careType === "Home visit" ? "Home Physiotherapy consultation" : "Online Physiotherapy consultation";
    const result = db.prepare(`
      INSERT INTO appointments
        (patient_user_id, physio_user_id, physio_name, title, care_type, scheduled_at, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patient.id, physio.id, physio.name, title, careType, scheduledAt.toISOString(), status, nowIso());
    res.status(201).json({ appointment: db.prepare("SELECT * FROM appointments WHERE id = ?").get(result.lastInsertRowid) });
  } catch (error) { next(error); }
});

app.patch("/api/admin/appointments/:id", requireAdmin, (req, res, next) => {
  try {
    const booking = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
    if (!booking) throw apiError(404, "Appointment request not found.");
    const allowedStatuses = ["requested", "confirmed", "completed", "cancelled"];
    const nextStatus = String(req.body.status || booking.status).toLowerCase();
    if (!allowedStatuses.includes(nextStatus)) throw apiError(400, "Invalid appointment status.");
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : new Date(booking.scheduled_at);
    if (Number.isNaN(scheduledAt.getTime())) throw apiError(400, "Enter a valid preferred date and time.");
    let physioUserId = booking.physio_user_id;
    let physioName = booking.physio_name;
    if (Object.prototype.hasOwnProperty.call(req.body, "physioUserId")) {
      physioUserId = req.body.physioUserId ? Number(req.body.physioUserId) : null;
      if (physioUserId) {
        const physio = db.prepare(`
          SELECT u.id, p.name FROM users u JOIN profiles p ON p.user_id = u.id
          WHERE u.id = ? AND u.role = 'physio'
        `).get(physioUserId);
        if (!physio) throw apiError(404, "Physio account not found.");
        physioName = physio.name;
      } else {
        physioName = "";
      }
    }
    db.prepare("UPDATE appointments SET status = ?, physio_user_id = ?, physio_name = ?, scheduled_at = ? WHERE id = ?")
      .run(nextStatus, physioUserId, physioName, scheduledAt.toISOString(), booking.id);
    res.json({ appointment: db.prepare("SELECT * FROM appointments WHERE id = ?").get(booking.id) });
  } catch (error) { next(error); }
});

app.patch("/api/admin/physios/:id/verification", requireAdmin, (req, res, next) => {
  try {
    const allowedStatuses = ["pending", "verified", "rejected"];
    const status = String(req.body.status || "").toLowerCase();
    if (!allowedStatuses.includes(status)) throw apiError(400, "Invalid verification status.");
    const physio = db.prepare("SELECT u.id FROM users u WHERE u.id = ? AND u.role = 'physio'").get(req.params.id);
    if (!physio) throw apiError(404, "Physio account not found.");
    db.prepare("UPDATE profiles SET credential_status = ?, updated_at = ? WHERE user_id = ?").run(status, nowIso(), physio.id);
    res.json({ physioId: physio.id, credentialStatus: status });
  } catch (error) { next(error); }
});

app.get("/api/me", requireAuth, (req, res, next) => {
  try { res.json({ user: serializeProfile(findFullUser(req.auth.user_id)) }); }
  catch (error) { next(error); }
});

app.patch("/api/me", requireAuth, (req, res, next) => {
  try {
    const current = findFullUser(req.auth.user_id);
    const body = req.body || {};
    const nextProfile = {
      name: body.name ?? current.name,
      age: body.age ?? current.age,
      gender: body.gender ?? current.gender,
      mobile: body.mobile ?? current.mobile,
      address: body.address ?? current.address,
      city: body.city ?? current.city,
      state: body.state ?? current.state,
      pincode: body.pincode ?? current.pincode,
      landmark: body.landmark ?? current.landmark,
      qualification: body.qualification ?? current.qualification,
      degree: body.degree ?? current.degree,
      registrationNumber: body.registrationNumber ?? current.registration_number,
      concern: body.concern ?? current.concern,
      preferredCare: body.preferredCare ?? current.preferred_care,
    };
    if (!nextProfile.name || !nextProfile.mobile) throw apiError(400, "Name and mobile number are required.");
    db.prepare(`
      UPDATE profiles SET name=?, age=?, gender=?, mobile=?, address=?, city=?, state=?, pincode=?, landmark=?,
        qualification=?, degree=?, registration_number=?, concern=?, preferred_care=?, updated_at=? WHERE user_id=?
    `).run(
      nextProfile.name, nextProfile.age, nextProfile.gender, nextProfile.mobile, nextProfile.address,
      nextProfile.city, nextProfile.state, nextProfile.pincode, nextProfile.landmark, nextProfile.qualification,
      nextProfile.degree, nextProfile.registrationNumber, nextProfile.concern, nextProfile.preferredCare,
      nowIso(), req.auth.user_id,
    );
    res.json({ user: serializeProfile(findFullUser(req.auth.user_id)) });
  } catch (error) { next(error); }
});

app.get("/api/dashboard", requireAuth, (req, res, next) => {
  try {
    const profile = serializeProfile(findFullUser(req.auth.user_id));
    if (req.auth.role === "physio") {
      const visits = db.prepare(`
        SELECT a.id, a.patient_user_id, a.title, a.care_type, a.scheduled_at, a.status, a.created_at,
          patient.email AS patient_email, patient_profile.name AS patient_name,
          COALESCE(patient_profile.concern, a.title) AS concern,
          patient_profile.mobile AS patient_mobile, patient_profile.address, patient_profile.city,
          patient_profile.state, patient_profile.pincode
        FROM appointments a
        JOIN users patient ON patient.id = a.patient_user_id AND patient.role = 'patient'
        JOIN profiles patient_profile ON patient_profile.user_id = patient.id
        WHERE a.physio_user_id = ?
        ORDER BY a.scheduled_at DESC LIMIT 20
      `).all(req.auth.user_id);
      const totalPatients = db.prepare("SELECT COUNT(DISTINCT patient_user_id) AS count FROM appointments WHERE physio_user_id = ?").get(req.auth.user_id).count;
      const completed = visits.filter((visit) => visit.status === "completed").length;
      return res.json({ profile, stats: { totalPatients, todayVisits: visits.filter((visit) => visit.scheduled_at.slice(0, 10) === nowIso().slice(0, 10)).length, completedVisits: completed, careHours: completed }, visits });
    }
    const appointments = db.prepare(`
      SELECT a.id, a.patient_user_id, a.physio_user_id, a.title, a.care_type, a.scheduled_at,
        a.status, a.created_at, COALESCE(physio_profile.name, a.physio_name) AS physio_name
      FROM appointments a
      LEFT JOIN users physio ON physio.id = a.physio_user_id AND physio.role = 'physio'
      LEFT JOIN profiles physio_profile ON physio_profile.user_id = physio.id
      WHERE a.patient_user_id = ? ORDER BY a.scheduled_at ASC LIMIT 20
    `).all(req.auth.user_id);
    const completed = appointments.filter((item) => item.status === "completed").length;
    res.json({ profile, stats: { upcomingVisits: appointments.filter((item) => item.status !== "completed").length, completedSessions: completed, recoveryProgress: Math.min(100, completed * 10), careReports: completed }, appointments });
  } catch (error) { next(error); }
});

app.patch("/api/visits/:id", requireAuth, (req, res, next) => {
  try {
    if (req.auth.role !== "physio") throw apiError(403, "Only Physio accounts can update visits.");
    const visit = db.prepare("SELECT * FROM visits WHERE id = ? AND physio_user_id = ?").get(req.params.id, req.auth.user_id);
    if (!visit) throw apiError(404, "Visit not found.");
    db.prepare("UPDATE visits SET status = ?, notes = ? WHERE id = ?").run(req.body.status || visit.status, req.body.notes ?? visit.notes, visit.id);
    res.json({ visit: db.prepare("SELECT * FROM visits WHERE id = ?").get(visit.id) });
  } catch (error) { next(error); }
});

app.post("/api/appointments", requireAuth, (req, res, next) => {
  try {
    if (req.auth.role !== "patient") throw apiError(403, "Only Patient accounts can request appointments.");
    const { careType, scheduledAt } = req.body;
    const allowedCareTypes = ["Home visit", "Online consultation"];
    if (!allowedCareTypes.includes(careType)) throw apiError(400, "Choose Home visit or Online consultation.");
    if (!scheduledAt) throw apiError(400, "Preferred date and time are required.");
    const parsedDate = new Date(scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) throw apiError(400, "Enter a valid appointment date and time.");
    const title = careType === "Home visit" ? "Home Physiotherapy consultation" : "Online Physiotherapy consultation";
    const result = db.prepare("INSERT INTO appointments (patient_user_id, physio_name, title, care_type, scheduled_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(req.auth.user_id, "", title, careType, parsedDate.toISOString(), "requested", nowIso());
    res.status(201).json({ appointment: db.prepare("SELECT * FROM appointments WHERE id = ?").get(result.lastInsertRowid) });
  } catch (error) { next(error); }
});

app.get("/api/me/degree-document", requireAuth, (req, res, next) => {
  try {
    const row = db.prepare("SELECT degree_file_name, degree_file_path FROM profiles WHERE user_id = ?").get(req.auth.user_id);
    if (!row?.degree_file_path || !existsSync(row.degree_file_path)) throw apiError(404, "Degree document not found.");
    res.download(resolve(row.degree_file_path), row.degree_file_name);
  } catch (error) { next(error); }
});

if (production) {
  const distDir = resolve(process.cwd(), "dist");
  app.use(express.static(distDir));
  app.get(/.*/, (_req, res) => res.sendFile(resolve(distDir, "index.html")));
}

app.use((error, _req, res, _next) => {
  const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: { code: error.code || "SERVER_ERROR", message: error.message || "Something went wrong." } });
});

cleanupExpiredRecords();
app.listen(port, "127.0.0.1", () => {
  console.info(`GetYourPhysio API running at http://127.0.0.1:${port}`);
});
