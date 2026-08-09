import "dotenv/config";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { extname, resolve } from "node:path";
import express from "express";
import multer from "multer";
import {
  closeDatabase,
  collections,
  connectDatabase,
  getDegreeBucket,
  toObjectId,
} from "./database.mjs";
import { getEmailMode, sendCredentialStatusEmail, sendOtpEmail } from "./mailer.mjs";

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const production = process.env.NODE_ENV === "production";
const maxDegreeFileSize = 3 * 1024 * 1024;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const hash = (value) => createHash("sha256").update(value).digest("hex");
const normalizeEmail = (value = "") => String(value).trim().toLowerCase();
const now = () => new Date();
const futureDate = (milliseconds) => new Date(Date.now() + milliseconds);
const idString = (value) => value ? String(value) : null;
const validAccountRole = (role) => role === "physio" || role === "patient";

function apiError(status, message, code = "REQUEST_FAILED") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function requiredObjectId(value, label = "record") {
  const objectId = toObjectId(value);
  if (!objectId) throw apiError(400, `Invalid ${label} ID.`);
  return objectId;
}

async function issueSession(userId) {
  const token = randomBytes(32).toString("base64url");
  await collections.sessions.insertOne({
    userId,
    tokenHash: hash(token),
    expiresAt: futureDate(30 * 24 * 60 * 60 * 1000),
    createdAt: now(),
  });
  return token;
}

async function issueAdminSession(adminId) {
  const token = randomBytes(32).toString("base64url");
  await collections.adminSessions.insertOne({
    adminId,
    tokenHash: hash(token),
    expiresAt: futureDate(12 * 60 * 60 * 1000),
    createdAt: now(),
  });
  return token;
}

function serializeProfile(user, profile) {
  if (!user || !profile) return null;
  return {
    id: idString(user._id),
    role: user.role,
    email: user.email,
    name: profile.name,
    age: profile.age || "",
    gender: profile.gender || "",
    mobile: profile.mobile || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
    landmark: profile.landmark || "",
    location: profile.latitude !== "" && profile.longitude !== ""
      ? { lat: profile.latitude, lng: profile.longitude }
      : null,
    qualification: profile.qualification || "",
    degree: profile.degree || "",
    registrationNumber: profile.registrationNumber || "",
    degreeFile: profile.degreeFileName || "",
    credentialStatus: profile.credentialStatus || "",
    concern: profile.concern || "",
    preferredCare: profile.preferredCare || "",
  };
}

async function findFullUser(userId) {
  const [user, profile] = await Promise.all([
    collections.users.findOne({ _id: userId }),
    collections.profiles.findOne({ userId }),
  ]);
  return { user, profile };
}

async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw apiError(401, "Please log in to continue.", "AUTH_REQUIRED");
    const session = await collections.sessions.findOne({
      tokenHash: hash(token),
      expiresAt: { $gt: now() },
    });
    if (!session) throw apiError(401, "Your session has expired. Please log in again.", "SESSION_EXPIRED");
    const user = await collections.users.findOne({ _id: session.userId });
    if (!user) throw apiError(401, "Your session is no longer valid.", "SESSION_EXPIRED");
    req.auth = { sessionId: session._id, userId: user._id, role: user.role, token };
    next();
  } catch (error) {
    next(error);
  }
}

async function requireAdmin(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw apiError(401, "Admin login is required.", "ADMIN_AUTH_REQUIRED");
    const session = await collections.adminSessions.findOne({
      tokenHash: hash(token),
      expiresAt: { $gt: now() },
    });
    if (!session) throw apiError(401, "Your Admin session has expired.", "ADMIN_SESSION_EXPIRED");
    const admin = await collections.admins.findOne({ _id: session.adminId, isActive: true });
    if (!admin) throw apiError(401, "Your Admin session is no longer valid.", "ADMIN_SESSION_EXPIRED");
    req.admin = {
      sessionId: session._id,
      adminId: admin._id,
      email: admin.email,
      name: admin.name,
      token,
    };
    next();
  } catch (error) {
    next(error);
  }
}

const degreeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxDegreeFileSize, files: 1 },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === "application/pdf" && extname(file.originalname).toLowerCase() === ".pdf";
    callback(isPdf ? null : apiError(400, "Degree document must be a PDF."), isPdf);
  },
});

function uploadDegreeFile(file, userId) {
  return new Promise((resolveUpload, rejectUpload) => {
    const uploadStream = getDegreeBucket().openUploadStream(file.originalname, {
      contentType: "application/pdf",
      metadata: { userId, purpose: "physio-degree" },
    });
    uploadStream.on("error", rejectUpload);
    uploadStream.on("finish", () => resolveUpload(uploadStream.id));
    uploadStream.end(file.buffer);
  });
}

async function deleteDegreeFile(fileId) {
  if (!fileId) return;
  try {
    await getDegreeBucket().delete(fileId);
  } catch (error) {
    if (!/FileNotFound/i.test(error.message)) throw error;
  }
}

async function sendDegreeDocument(profile, res) {
  if (!profile?.degreeFileId) throw apiError(404, "Degree document not found.");
  const file = await getDegreeBucket().find({ _id: profile.degreeFileId }).next();
  if (!file) throw apiError(404, "Degree document not found.");

  res.type(file.contentType || "application/pdf");
  res.attachment(profile.degreeFileName || file.filename || "degree-document.pdf");
  const stream = getDegreeBucket().openDownloadStream(profile.degreeFileId);
  stream.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({ error: { code: "DOCUMENT_DOWNLOAD_FAILED", message: "The degree document could not be downloaded." } });
    } else {
      res.destroy(error);
    }
  });
  stream.pipe(res);
}

function serializeAppointment(appointment) {
  return {
    id: idString(appointment._id),
    patient_user_id: idString(appointment.patientUserId),
    physio_user_id: idString(appointment.physioUserId),
    physio_name: appointment.physioName || "",
    title: appointment.title,
    care_type: appointment.careType || "",
    scheduled_at: appointment.scheduledAt,
    status: appointment.status,
    created_at: appointment.createdAt,
  };
}

function serializeVisit(visit) {
  return {
    id: idString(visit._id),
    physio_user_id: idString(visit.physioUserId),
    patient_name: visit.patientName,
    patient_email: visit.patientEmail || "",
    concern: visit.concern,
    scheduled_at: visit.scheduledAt,
    status: visit.status,
    notes: visit.notes || "",
    created_at: visit.createdAt,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "getyourphysio-api",
    database: "mongodb",
    emailMode: getEmailMode(),
  });
});

// OTP bypass: direct email login is enabled for the current demo.
// The OTP request/verification routes below are intentionally retained so the
// verification flow can be restored without recreating it.
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = req.body.role;
    if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, "Enter a valid email address.");
    if (role !== "physio" && role !== "admin") throw apiError(400, "Only Physio or Admin login is available.");

    if (role === "admin") {
      const admin = await collections.admins.findOne({ email, isActive: true });
      if (!admin) throw apiError(404, "Admin account not found.", "ACCOUNT_NOT_FOUND");
      const token = await issueAdminSession(admin._id);
      return res.json({
        token,
        user: { id: idString(admin._id), email: admin.email, name: admin.name, role: "admin" },
      });
    }

    const user = await collections.users.findOne({ email, role });
    if (!user) throw apiError(404, "No account was found. Please sign up first.", "ACCOUNT_NOT_FOUND");
    const { profile } = await findFullUser(user._id);
    if (!profile) throw apiError(404, "Account profile not found.", "ACCOUNT_NOT_FOUND");
    const token = await issueSession(user._id);
    res.json({ token, user: serializeProfile(user, profile) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/request-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { role, purpose } = req.body;
    if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, "Enter a valid email address.");
    if (role !== "physio" && role !== "admin") throw apiError(400, "Only Physio or Admin login is available.");
    if (purpose !== "login" && purpose !== "registration") throw apiError(400, "Invalid OTP purpose.");
    if (role === "admin" && purpose !== "login") {
      throw apiError(403, "Admin accounts can only be created from the server command.");
    }

    const user = role === "admin"
      ? await collections.admins.findOne({ email, isActive: true })
      : await collections.users.findOne({ email, role });
    if (purpose === "login" && !user) {
      throw apiError(404, "No account was found. Please sign up first.", "ACCOUNT_NOT_FOUND");
    }
    if (purpose === "registration" && user) {
      throw apiError(409, "An account already exists. Please log in instead.", "ACCOUNT_EXISTS");
    }

    const recent = await collections.otpChallenges.findOne(
      { email, role, purpose },
      { sort: { createdAt: -1 } },
    );
    if (recent && Date.now() - recent.createdAt.getTime() < 30_000) {
      throw apiError(429, "Please wait 30 seconds before requesting another code.", "OTP_RATE_LIMIT");
    }

    const otp = String(randomInt(100000, 1000000));
    const challenge = await collections.otpChallenges.insertOne({
      email,
      role,
      purpose,
      codeHash: hash(otp),
      expiresAt: futureDate(10 * 60 * 1000),
      attempts: 0,
      consumedAt: null,
      createdAt: now(),
    });

    let delivery;
    try {
      delivery = await sendOtpEmail({ email, otp, purpose });
    } catch (deliveryError) {
      await collections.otpChallenges.deleteOne({ _id: challenge.insertedId });
      console.error("OTP email delivery failed:", deliveryError.message);
      throw apiError(502, "We could not send the OTP email. Check the SMTP settings and try again.", "OTP_DELIVERY_FAILED");
    }

    res.status(201).json({
      message: delivery.delivered ? `OTP sent to ${delivery.recipient}.` : "Development OTP created.",
      deliveryMode: delivery.mode,
      recipient: delivery.recipient,
      ...(production || delivery.delivered ? {} : { developmentOtp: otp }),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/verify-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { role, purpose, otp } = req.body;
    if (role !== "physio" && role !== "admin") throw apiError(400, "Only Physio or Admin login is available.");
    const challenge = await collections.otpChallenges.findOne(
      { email, role, purpose, consumedAt: null },
      { sort: { createdAt: -1 } },
    );
    if (!challenge || challenge.expiresAt <= now()) {
      throw apiError(400, "This OTP has expired. Request a new one.", "OTP_EXPIRED");
    }
    if (challenge.attempts >= 5) {
      throw apiError(429, "Too many incorrect attempts. Request a new OTP.", "OTP_LOCKED");
    }
    if (hash(String(otp || "")) !== challenge.codeHash) {
      await collections.otpChallenges.updateOne({ _id: challenge._id }, { $inc: { attempts: 1 } });
      throw apiError(400, "The OTP you entered is incorrect.", "OTP_INCORRECT");
    }
    await collections.otpChallenges.updateOne({ _id: challenge._id }, { $set: { consumedAt: now() } });

    if (purpose === "login") {
      if (role === "admin") {
        const admin = await collections.admins.findOne({ email, isActive: true });
        if (!admin) throw apiError(404, "Admin account not found.", "ACCOUNT_NOT_FOUND");
        const token = await issueAdminSession(admin._id);
        return res.json({
          token,
          user: { id: idString(admin._id), email: admin.email, name: admin.name, role: "admin" },
        });
      }

      const user = await collections.users.findOne({ email, role });
      if (!user) throw apiError(404, "Account not found.", "ACCOUNT_NOT_FOUND");
      const { profile } = await findFullUser(user._id);
      if (!profile) throw apiError(404, "Account profile not found.", "ACCOUNT_NOT_FOUND");
      const token = await issueSession(user._id);
      return res.json({ token, user: serializeProfile(user, profile) });
    }

    const verificationToken = randomBytes(32).toString("base64url");
    await collections.verificationTokens.insertOne({
      email,
      role,
      tokenHash: hash(verificationToken),
      expiresAt: futureDate(30 * 60 * 1000),
      consumedAt: null,
      createdAt: now(),
    });
    res.json({ verificationToken });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", degreeUpload.single("degreeFile"), async (req, res, next) => {
  let userId = null;
  let degreeFileId = null;
  try {
    const role = req.body.role;
    // OTP bypass: registration no longer requires a verification token.
    let profile;
    try {
      profile = JSON.parse(req.body.profile || "{}");
    } catch {
      throw apiError(400, "Profile data is invalid.");
    }

    const email = normalizeEmail(profile.email);
    if (role !== "physio") throw apiError(400, "Only Physio registration is available.");
    const commonRequired = [profile.name, profile.age, profile.gender, profile.mobile, email, profile.address, profile.city];
    if (commonRequired.some((value) => !String(value || "").trim())) {
      throw apiError(400, "Complete all required personal and address details.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, "Enter a valid email address.");
    if (!/^\+?[0-9\s-]{7,18}$/.test(profile.mobile)) throw apiError(400, "Enter a valid mobile number.");
    if (role === "physio" && (
      !profile.state
      || !profile.pincode
      || !profile.qualification
      || !profile.degree
      || !req.file
    )) {
      throw apiError(400, "Complete all practice and qualification details and upload the degree PDF.");
    }
    if (req.file && req.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw apiError(400, "The uploaded degree document is not a valid PDF.");
    }

    if (await collections.users.findOne({ email, role })) {
      throw apiError(409, "This account already exists.");
    }

    const createdAt = now();
    const userResult = await collections.users.insertOne({
      email,
      role,
      emailVerifiedAt: null,
      createdAt,
    });
    userId = userResult.insertedId;

    if (role === "physio") degreeFileId = await uploadDegreeFile(req.file, userId);

    await collections.profiles.insertOne({
      userId,
      name: String(profile.name).trim(),
      age: profile.age || "",
      gender: profile.gender || "",
      mobile: profile.mobile,
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
      landmark: profile.landmark || "",
      latitude: profile.location?.lat ?? "",
      longitude: profile.location?.lng ?? "",
      qualification: profile.qualification || "",
      degree: profile.degree || "",
      registrationNumber: profile.registrationNumber || "",
      degreeFileId,
      degreeFileName: req.file?.originalname || "",
      credentialStatus: role === "physio" ? "pending" : "not_applicable",
      concern: profile.concern || "",
      preferredCare: profile.preferredCare || "",
      updatedAt: createdAt,
    });
    const user = await collections.users.findOne({ _id: userId });
    const storedProfile = await collections.profiles.findOne({ userId });
    const token = await issueSession(userId);
    res.status(201).json({ token, user: serializeProfile(user, storedProfile) });
  } catch (error) {
    if (userId) {
      await Promise.allSettled([
        collections.profiles.deleteOne({ userId }),
        collections.users.deleteOne({ _id: userId }),
        deleteDegreeFile(degreeFileId),
      ]);
    }
    next(error);
  }
});

app.post("/api/auth/logout", requireAuth, async (req, res, next) => {
  try {
    await collections.sessions.deleteOne({ _id: req.auth.sessionId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/logout", requireAdmin, async (req, res, next) => {
  try {
    await collections.adminSessions.deleteOne({ _id: req.admin.sessionId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/overview", requireAdmin, async (req, res, next) => {
  try {
    const location = String(req.query.location || "").trim().toLowerCase();
    const status = String(req.query.status || "all").trim().toLowerCase();
    const includesLocation = (row) => !location
      || [row.city, row.state, row.address, row.pincode]
        .some((value) => String(value || "").toLowerCase().includes(location));

    const [users, profiles, appointmentDocuments] = await Promise.all([
      collections.users.find({}).sort({ createdAt: -1 }).toArray(),
      collections.profiles.find({}).toArray(),
      collections.appointments.find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    const usersById = new Map(users.map((user) => [idString(user._id), user]));
    const profilesByUserId = new Map(profiles.map((profile) => [idString(profile.userId), profile]));
    const appointmentCountByPatient = new Map();
    const bookingCountByPhysio = new Map();
    for (const appointment of appointmentDocuments) {
      const patientId = idString(appointment.patientUserId);
      const physioId = idString(appointment.physioUserId);
      appointmentCountByPatient.set(patientId, (appointmentCountByPatient.get(patientId) || 0) + 1);
      if (physioId) bookingCountByPhysio.set(physioId, (bookingCountByPhysio.get(physioId) || 0) + 1);
    }

    const patients = users
      .filter((user) => user.role === "patient")
      .map((user) => {
        const profile = profilesByUserId.get(idString(user._id)) || {};
        return {
          id: idString(user._id),
          email: user.email,
          created_at: user.createdAt,
          name: profile.name || "",
          age: profile.age || "",
          gender: profile.gender || "",
          mobile: profile.mobile || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          concern: profile.concern || "",
          preferred_care: profile.preferredCare || "",
          appointment_count: appointmentCountByPatient.get(idString(user._id)) || 0,
        };
      })
      .filter(includesLocation);

    const physios = users
      .filter((user) => user.role === "physio")
      .map((user) => {
        const profile = profilesByUserId.get(idString(user._id)) || {};
        return {
          id: idString(user._id),
          email: user.email,
          created_at: user.createdAt,
          name: profile.name || "",
          mobile: profile.mobile || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          qualification: profile.qualification || "",
          degree: profile.degree || "",
          registration_number: profile.registrationNumber || "",
          degree_file_name: profile.degreeFileName || "",
          has_degree_document: Boolean(profile.degreeFileId),
          credential_status: profile.credentialStatus || "pending",
          booking_count: bookingCountByPhysio.get(idString(user._id)) || 0,
        };
      })
      .filter(includesLocation);

    const bookings = appointmentDocuments
      .map((appointment) => {
        const patient = usersById.get(idString(appointment.patientUserId)) || {};
        const patientProfile = profilesByUserId.get(idString(appointment.patientUserId)) || {};
        const physioProfile = profilesByUserId.get(idString(appointment.physioUserId)) || {};
        return {
          ...serializeAppointment(appointment),
          physio_name: physioProfile.name || appointment.physioName || "",
          patient_email: patient.email || "",
          patient_name: patientProfile.name || "",
          patient_mobile: patientProfile.mobile || "",
          address: patientProfile.address || "",
          city: patientProfile.city || "",
          state: patientProfile.state || "",
          pincode: patientProfile.pincode || "",
          concern: patientProfile.concern || "",
        };
      })
      .filter((booking) => includesLocation(booking) && (status === "all" || booking.status.toLowerCase() === status));

    const patientOptions = [...patients]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, email, name, mobile, city, state }) => ({ id, email, name, mobile, city, state }));
    const physioOptions = [...physios]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((physio) => ({
        id: physio.id,
        email: physio.email,
        name: physio.name,
        mobile: physio.mobile,
        city: physio.city,
        state: physio.state,
        credential_status: physio.credential_status,
      }));

    const allPatients = users.filter((user) => user.role === "patient");
    const allPhysios = users.filter((user) => user.role === "physio");
    const pendingCredentials = allPhysios.filter((user) => {
      const profile = profilesByUserId.get(idString(user._id));
      return profile?.credentialStatus === "pending";
    }).length;

    res.json({
      admin: {
        id: idString(req.admin.adminId),
        name: req.admin.name,
        email: req.admin.email,
        role: "admin",
      },
      stats: {
        patients: allPatients.length,
        physios: allPhysios.length,
        bookings: appointmentDocuments.length,
        pendingCredentials,
      },
      filters: { location, status },
      patients,
      physios,
      bookings,
      patientOptions,
      physioOptions,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/patients", requireAdmin, async (req, res, next) => {
  let userId = null;
  try {
    const email = normalizeEmail(req.body.email);
    const patient = {
      name: String(req.body.name || "").trim(),
      age: String(req.body.age || "").trim(),
      gender: String(req.body.gender || "").trim(),
      mobile: String(req.body.mobile || "").trim(),
      address: String(req.body.address || "").trim(),
      city: String(req.body.city || "").trim(),
      state: String(req.body.state || "").trim(),
      pincode: String(req.body.pincode || "").trim(),
      concern: String(req.body.concern || "").trim(),
    };
    if ([patient.name, patient.age, patient.gender, patient.mobile, email].some((value) => !value)) {
      throw apiError(400, "Enter the Patient's name, age, gender, mobile number and email.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, "Enter a valid Patient email address.");
    if (!/^\+?[0-9\s-]{7,18}$/.test(patient.mobile)) throw apiError(400, "Enter a valid Patient mobile number.");
    const patientAge = Number(patient.age);
    if (!Number.isInteger(patientAge) || patientAge < 1 || patientAge > 110) {
      throw apiError(400, "Enter a valid Patient age between 1 and 110.");
    }
    if (patient.pincode && !/^\d{6}$/.test(patient.pincode)) throw apiError(400, "Enter a valid 6-digit PIN code.");
    if (await collections.users.findOne({ email, role: "patient" })) {
      throw apiError(409, "A Patient with this email already exists.", "ACCOUNT_EXISTS");
    }

    const createdAt = now();
    const userResult = await collections.users.insertOne({
      email,
      role: "patient",
      emailVerifiedAt: null,
      createdByAdminId: req.admin.adminId,
      createdAt,
    });
    userId = userResult.insertedId;
    await collections.profiles.insertOne({
      userId,
      ...patient,
      landmark: "",
      latitude: "",
      longitude: "",
      qualification: "",
      degree: "",
      registrationNumber: "",
      degreeFileId: null,
      degreeFileName: "",
      credentialStatus: "not_applicable",
      preferredCare: "",
      updatedAt: createdAt,
    });

    const user = await collections.users.findOne({ _id: userId });
    const profile = await collections.profiles.findOne({ userId });
    res.status(201).json({ patient: serializeProfile(user, profile) });
  } catch (error) {
    if (userId) {
      await Promise.allSettled([
        collections.profiles.deleteOne({ userId }),
        collections.users.deleteOne({ _id: userId }),
      ]);
    }
    next(error);
  }
});

app.post("/api/admin/appointments", requireAdmin, async (req, res, next) => {
  try {
    const patientUserId = requiredObjectId(req.body.patientUserId, "patient");
    const physioUserId = requiredObjectId(req.body.physioUserId, "Physio");
    const careType = String(req.body.careType || "");
    const allowedCareTypes = ["Home visit", "Online consultation"];
    const allowedStatuses = ["requested", "confirmed", "completed", "cancelled"];
    const status = String(req.body.status || "confirmed").toLowerCase();
    if (!allowedCareTypes.includes(careType)) throw apiError(400, "Choose Home visit or Online consultation.");
    if (!allowedStatuses.includes(status)) throw apiError(400, "Invalid appointment status.");
    const scheduledAt = new Date(req.body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) throw apiError(400, "Enter a valid booking date and time.");

    const [patient, physio, physioProfile] = await Promise.all([
      collections.users.findOne({ _id: patientUserId, role: "patient" }),
      collections.users.findOne({ _id: physioUserId, role: "physio" }),
      collections.profiles.findOne({ userId: physioUserId }),
    ]);
    if (!patient) throw apiError(404, "Patient account not found.");
    if (!physio || !physioProfile) throw apiError(404, "Physio account not found.");

    const title = careType === "Home visit"
      ? "Home Physiotherapy consultation"
      : "Online Physiotherapy consultation";
    const appointment = {
      patientUserId,
      physioUserId,
      physioName: physioProfile.name,
      title,
      careType,
      scheduledAt,
      status,
      createdAt: now(),
    };
    const result = await collections.appointments.insertOne(appointment);
    res.status(201).json({ appointment: serializeAppointment({ ...appointment, _id: result.insertedId }) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/appointments/:id", requireAdmin, async (req, res, next) => {
  try {
    const appointmentId = requiredObjectId(req.params.id, "appointment");
    const booking = await collections.appointments.findOne({ _id: appointmentId });
    if (!booking) throw apiError(404, "Appointment request not found.");

    const allowedStatuses = ["requested", "confirmed", "completed", "cancelled"];
    const nextStatus = String(req.body.status || booking.status).toLowerCase();
    if (!allowedStatuses.includes(nextStatus)) throw apiError(400, "Invalid appointment status.");
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : booking.scheduledAt;
    if (Number.isNaN(scheduledAt.getTime())) throw apiError(400, "Enter a valid preferred date and time.");

    let physioUserId = booking.physioUserId || null;
    let physioName = booking.physioName || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "physioUserId")) {
      physioUserId = req.body.physioUserId
        ? requiredObjectId(req.body.physioUserId, "Physio")
        : null;
      if (physioUserId) {
        const [physio, physioProfile] = await Promise.all([
          collections.users.findOne({ _id: physioUserId, role: "physio" }),
          collections.profiles.findOne({ userId: physioUserId }),
        ]);
        if (!physio || !physioProfile) throw apiError(404, "Physio account not found.");
        physioName = physioProfile.name;
      } else {
        physioName = "";
      }
    }

    const updated = await collections.appointments.findOneAndUpdate(
      { _id: appointmentId },
      { $set: { status: nextStatus, physioUserId, physioName, scheduledAt } },
      { returnDocument: "after" },
    );
    res.json({ appointment: serializeAppointment(updated) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/physios/:id/verification", requireAdmin, async (req, res, next) => {
  try {
    const physioId = requiredObjectId(req.params.id, "Physio");
    const allowedStatuses = ["pending", "verified", "rejected"];
    const status = String(req.body.status || "").toLowerCase();
    if (!allowedStatuses.includes(status)) throw apiError(400, "Invalid verification status.");
    const [physio, profile] = await Promise.all([
      collections.users.findOne({ _id: physioId, role: "physio" }),
      collections.profiles.findOne({ userId: physioId }),
    ]);
    if (!physio || !profile) throw apiError(404, "Physio account not found.");
    if (profile.credentialStatus === status) {
      return res.json({
        physioId: idString(physioId),
        credentialStatus: status,
        notification: { delivered: false, mode: "skipped", reason: "status_unchanged" },
      });
    }

    const previousStatus = profile.credentialStatus || "pending";
    const previousUpdatedAt = profile.updatedAt;
    await collections.profiles.updateOne(
      { userId: physioId },
      { $set: { credentialStatus: status, updatedAt: now() } },
    );
    let notification;
    try {
      notification = await sendCredentialStatusEmail({
        email: physio.email,
        name: profile.name,
        status,
      });
    } catch (emailError) {
      await collections.profiles.updateOne(
        { userId: physioId },
        { $set: { credentialStatus: previousStatus, updatedAt: previousUpdatedAt || now() } },
      );
      console.error("Credential status email delivery failed:", emailError.message);
      throw apiError(
        502,
        "Verification status was not changed because the Physio notification email could not be sent.",
        "CREDENTIAL_EMAIL_FAILED",
      );
    }
    res.json({
      physioId: idString(physioId),
      credentialStatus: status,
      notification,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/physios/:id/degree-document", requireAdmin, async (req, res, next) => {
  try {
    const physioId = requiredObjectId(req.params.id, "Physio");
    const physio = await collections.users.findOne({ _id: physioId, role: "physio" });
    if (!physio) throw apiError(404, "Physio account not found.");
    const profile = await collections.profiles.findOne({ userId: physioId });
    await sendDegreeDocument(profile, res);
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", requireAuth, async (req, res, next) => {
  try {
    const { user, profile } = await findFullUser(req.auth.userId);
    if (!user || !profile) throw apiError(404, "Profile not found.");
    res.json({ user: serializeProfile(user, profile) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/me", requireAuth, async (req, res, next) => {
  try {
    const { user, profile: current } = await findFullUser(req.auth.userId);
    if (!user || !current) throw apiError(404, "Profile not found.");
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
      registrationNumber: body.registrationNumber ?? current.registrationNumber,
      concern: body.concern ?? current.concern,
      preferredCare: body.preferredCare ?? current.preferredCare,
      updatedAt: now(),
    };
    if (!nextProfile.name || !nextProfile.mobile) {
      throw apiError(400, "Name and mobile number are required.");
    }
    const updated = await collections.profiles.findOneAndUpdate(
      { userId: req.auth.userId },
      { $set: nextProfile },
      { returnDocument: "after" },
    );
    res.json({ user: serializeProfile(user, updated) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard", requireAuth, async (req, res, next) => {
  try {
    const { user, profile: profileDocument } = await findFullUser(req.auth.userId);
    if (!user || !profileDocument) throw apiError(404, "Profile not found.");
    const profile = serializeProfile(user, profileDocument);

    if (req.auth.role === "physio") {
      const appointmentDocuments = await collections.appointments
        .find({ physioUserId: req.auth.userId })
        .sort({ scheduledAt: -1 })
        .limit(20)
        .toArray();
      const patientIds = [...new Map(
        appointmentDocuments.map((appointment) => [idString(appointment.patientUserId), appointment.patientUserId]),
      ).values()];
      const [patientUsers, patientProfiles] = await Promise.all([
        collections.users.find({ _id: { $in: patientIds }, role: "patient" }).toArray(),
        collections.profiles.find({ userId: { $in: patientIds } }).toArray(),
      ]);
      const patientUsersById = new Map(patientUsers.map((item) => [idString(item._id), item]));
      const patientProfilesById = new Map(patientProfiles.map((item) => [idString(item.userId), item]));
      const visits = appointmentDocuments.map((appointment) => {
        const patient = patientUsersById.get(idString(appointment.patientUserId)) || {};
        const patientProfile = patientProfilesById.get(idString(appointment.patientUserId)) || {};
        return {
          ...serializeAppointment(appointment),
          patient_email: patient.email || "",
          patient_name: patientProfile.name || "",
          concern: patientProfile.concern || appointment.title,
          patient_mobile: patientProfile.mobile || "",
          address: patientProfile.address || "",
          city: patientProfile.city || "",
          state: patientProfile.state || "",
          pincode: patientProfile.pincode || "",
        };
      });
      const completed = visits.filter((visit) => visit.status === "completed").length;
      const today = now().toISOString().slice(0, 10);
      return res.json({
        profile,
        stats: {
          totalPatients: new Set(visits.map((visit) => visit.patient_user_id)).size,
          todayVisits: visits.filter((visit) => new Date(visit.scheduled_at).toISOString().slice(0, 10) === today).length,
          completedVisits: completed,
          careHours: completed,
        },
        visits,
      });
    }

    const appointmentDocuments = await collections.appointments
      .find({ patientUserId: req.auth.userId })
      .sort({ scheduledAt: 1 })
      .limit(20)
      .toArray();
    const physioIds = [...new Map(
      appointmentDocuments
        .filter((appointment) => appointment.physioUserId)
        .map((appointment) => [idString(appointment.physioUserId), appointment.physioUserId]),
    ).values()];
    const physioProfiles = await collections.profiles.find({ userId: { $in: physioIds } }).toArray();
    const physioProfilesById = new Map(physioProfiles.map((item) => [idString(item.userId), item]));
    const appointments = appointmentDocuments.map((appointment) => ({
      ...serializeAppointment(appointment),
      physio_name: physioProfilesById.get(idString(appointment.physioUserId))?.name || appointment.physioName || "",
    }));
    const completed = appointments.filter((item) => item.status === "completed").length;
    res.json({
      profile,
      stats: {
        upcomingVisits: appointments.filter((item) => item.status !== "completed").length,
        completedSessions: completed,
        recoveryProgress: Math.min(100, completed * 10),
        careReports: completed,
      },
      appointments,
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/visits/:id", requireAuth, async (req, res, next) => {
  try {
    if (req.auth.role !== "physio") {
      throw apiError(403, "Only Physio accounts can update visits.");
    }
    const visitId = requiredObjectId(req.params.id, "visit");
    const visit = await collections.visits.findOne({ _id: visitId, physioUserId: req.auth.userId });
    if (!visit) throw apiError(404, "Visit not found.");
    const updated = await collections.visits.findOneAndUpdate(
      { _id: visitId },
      { $set: { status: req.body.status || visit.status, notes: req.body.notes ?? visit.notes } },
      { returnDocument: "after" },
    );
    res.json({ visit: serializeVisit(updated) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/appointments", requireAuth, async (req, res, next) => {
  try {
    if (req.auth.role !== "patient") {
      throw apiError(403, "Only Patient accounts can request appointments.");
    }
    const { careType, scheduledAt } = req.body;
    const allowedCareTypes = ["Home visit", "Online consultation"];
    if (!allowedCareTypes.includes(careType)) {
      throw apiError(400, "Choose Home visit or Online consultation.");
    }
    if (!scheduledAt) throw apiError(400, "Preferred date and time are required.");
    const parsedDate = new Date(scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) throw apiError(400, "Enter a valid appointment date and time.");
    const title = careType === "Home visit"
      ? "Home Physiotherapy consultation"
      : "Online Physiotherapy consultation";
    const appointment = {
      patientUserId: req.auth.userId,
      physioUserId: null,
      physioName: "",
      title,
      careType,
      scheduledAt: parsedDate,
      status: "requested",
      createdAt: now(),
    };
    const result = await collections.appointments.insertOne(appointment);
    res.status(201).json({ appointment: serializeAppointment({ ...appointment, _id: result.insertedId }) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/me/degree-document", requireAuth, async (req, res, next) => {
  try {
    if (req.auth.role !== "physio") throw apiError(404, "Degree document not found.");
    const profile = await collections.profiles.findOne({ userId: req.auth.userId });
    await sendDegreeDocument(profile, res);
  } catch (error) {
    next(error);
  }
});

if (production) {
  const distDir = resolve(process.cwd(), "dist");
  app.use(express.static(distDir));
  app.get(/.*/, (_req, res) => res.sendFile(resolve(distDir, "index.html")));
}

app.use((error, _req, res, _next) => {
  let status = error.status || (error instanceof multer.MulterError ? 400 : 500);
  let message = error.message || "Something went wrong.";
  let code = error.code || "SERVER_ERROR";

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    message = "Degree PDF must be 3 MB or smaller.";
    code = "FILE_TOO_LARGE";
  } else if (error.code === 11000) {
    status = 409;
    message = "This account already exists.";
    code = "ACCOUNT_EXISTS";
  }

  if (status >= 500) console.error(error);
  res.status(status).json({ error: { code, message } });
});

await connectDatabase();
const server = app.listen(port, "0.0.0.0", () => {
  console.info(`GetYourPhysio API running at http://127.0.0.1:${port}`);
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
