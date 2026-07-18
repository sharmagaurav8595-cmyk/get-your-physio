# GetYourPhysio backend

The backend is a small Node API stored in `server/`. It uses Node's built-in SQLite database, so there is no separate database service to install.

## Folder structure

- `server/server.mjs` — API routes, authentication, profile updates, visits, appointments and protected document downloads.
- `server/database.mjs` — SQLite connection, database tables and local storage directories.
- `server/mailer.mjs` — real SMTP email delivery with a safe development fallback.
- `server/data/` — generated SQLite database files; ignored by Git.
- `server/uploads/degrees/` — private Physio degree PDFs; ignored by Git and not publicly served.
- `src/features/auth/api.js` — frontend API client and session-token handling.
- `.env.example` — SMTP configuration template.

## Start locally

Open two terminals in the project folder.

Or start both services together:

```powershell
npm run dev:all
```

To run them separately, use the following two terminals.

Terminal 1:

```powershell
npm run server
```

Terminal 2:

```powershell
npm run dev
```

The frontend uses Vite's `/api` proxy to reach `http://127.0.0.1:8787`.

## Development OTP

When SMTP is not configured and `NODE_ENV` is not `production`, the generated OTP is:

- printed in the backend terminal;
- returned to the frontend and displayed in the OTP dialog.

This development OTP is never returned by the production API.

## Configure real email OTP

Copy `.env.example` to `.env` and set:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Production OTP requests fail safely if SMTP is missing.

## Main API routes

- `GET /api/health`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/me`
- `PATCH /api/me`
- `GET /api/dashboard`
- `PATCH /api/visits/:id`
- `POST /api/appointments`
- `GET /api/me/degree-document`
- `GET /api/admin/overview`
- `POST /api/admin/appointments`
- `PATCH /api/admin/appointments/:id`
- `PATCH /api/admin/physios/:id/verification`
- `POST /api/admin/logout`

OTP codes, verification tokens and session tokens are stored as SHA-256 hashes. Sessions expire after 30 days, OTPs after 10 minutes, and registration verification tokens after 30 minutes.

## Admin / super user

Admin is a separate account type. It does not log in as a Patient or Physio.

Create or reactivate an Admin from the project folder:

```powershell
npm run create-admin -- admin@getyourphysio.in "GetYourPhysio Super Admin"
```

Then:

1. Start the backend and frontend.
2. Open `http://localhost:5173/admin/login`.
3. Enter the Admin email.
4. Enter the email OTP. In local development it is also printed in the backend terminal and displayed in the OTP dialog.

The protected Admin dashboard is at `http://localhost:5173/admin`. It displays:

- every Patient account;
- every Physio account and credential status;
- all Patient booking requests with contact and care information;
- a form to create a booking for a selected Patient and assign it to any registered Physio;
- location filtering by city, state, PIN code or address;
- booking status filtering and updates;
- preferred appointment date/time updates;
- Physio reassignment from the Bookings table;
- Physio credential status changes between Pending, Verified and Rejected.

An Admin-created booking is stored once in `appointments` with both the Patient user ID and assigned Physio user ID. The Patient dashboard shows the assigned Physio's name, and the selected Physio dashboard shows that Patient and booking. Changing the assignment in Admin moves the booking from the old Physio dashboard to the newly assigned Physio dashboard.

See `EMAIL_OTP_SETUP.md` for email OTP and SMTP setup.
