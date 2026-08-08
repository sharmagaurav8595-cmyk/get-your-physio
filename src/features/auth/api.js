const LEGACY_TOKEN_KEY = "gyp-session-token";
const USER_TOKEN_KEY = "gyp-user-session-token";
const ADMIN_TOKEN_KEY = "gyp-admin-session-token";

export function getSessionToken() {
  return localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

export function setSessionToken(token) {
  if (token) localStorage.setItem(USER_TOKEN_KEY, token);
  else localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getAdminSessionToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

export function setAdminSessionToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = path.startsWith("/api/admin/") ? getAdminSessionToken() : getSessionToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error("The backend is not reachable. Start it with npm run server.");
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message || "The request could not be completed.");
    error.code = data?.error?.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export function requestOtp(email, role, purpose) {
  return request("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ email, role, purpose }) });
}

export function verifyOtp(email, role, purpose, otp) {
  return request("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, role, purpose, otp }) });
}

export function loginAccount(email, role) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, role }) });
}

export async function registerAccount(role, profile, degreeFile) {
  const form = new FormData();
  form.append("role", role);
  form.append("profile", JSON.stringify(profile));
  if (degreeFile) form.append("degreeFile", degreeFile);
  const result = await request("/api/auth/register", { method: "POST", body: form });
  setSessionToken(result.token);
  return result;
}

export function getDashboard() {
  return request("/api/dashboard", { cache: "no-store" });
}

export function updateProfile(profile) {
  return request("/api/me", { method: "PATCH", body: JSON.stringify(profile) });
}

export async function logout() {
  try { await request("/api/auth/logout", { method: "POST" }); }
  finally { setSessionToken(""); }
}

export async function adminLogout() {
  try { await request("/api/admin/logout", { method: "POST" }); }
  finally { setAdminSessionToken(""); }
}

export function getAdminOverview({ location = "", status = "all" } = {}) {
  const query = new URLSearchParams({ location, status });
  return request(`/api/admin/overview?${query}`);
}

export function updateAdminAppointment(id, updates) {
  return request(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
}

export function createAdminAppointment(appointment) {
  return request("/api/admin/appointments", { method: "POST", body: JSON.stringify(appointment) });
}

export function createAdminPatient(patient) {
  return request("/api/admin/patients", { method: "POST", body: JSON.stringify(patient) });
}

export function updatePhysioVerification(id, status) {
  return request(`/api/admin/physios/${id}/verification`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function downloadAdminPhysioDegreeDocument(id) {
  const token = getAdminSessionToken();
  const response = await fetch(`/api/admin/physios/${id}/degree-document`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = new Error(data?.error?.message || "The degree document could not be downloaded.");
    error.code = data?.error?.code;
    error.status = response.status;
    throw error;
  }
  const disposition = response.headers.get("Content-Disposition") || "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: await response.blob(),
    filename: encodedName ? decodeURIComponent(encodedName) : plainName || "degree-document.pdf",
  };
}

export function createAppointment(appointment) {
  return request("/api/appointments", { method: "POST", body: JSON.stringify(appointment) });
}
