const TOKEN_KEY = "gyp-session-token";

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setSessionToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getSessionToken();
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

export async function registerAccount(role, profile, verificationToken, degreeFile) {
  const form = new FormData();
  form.append("role", role);
  form.append("verificationToken", verificationToken);
  form.append("profile", JSON.stringify(profile));
  if (degreeFile) form.append("degreeFile", degreeFile);
  const result = await request("/api/auth/register", { method: "POST", body: form });
  setSessionToken(result.token);
  return result;
}

export function getDashboard() {
  return request("/api/dashboard");
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
  finally { setSessionToken(""); }
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

export function updatePhysioVerification(id, status) {
  return request(`/api/admin/physios/${id}/verification`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function createAppointment(appointment) {
  return request("/api/appointments", { method: "POST", body: JSON.stringify(appointment) });
}
