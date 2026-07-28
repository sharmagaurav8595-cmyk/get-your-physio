# GetYourPhysio backend

The backend is a Node.js + Express API stored in `server/`. It uses MongoDB for all persistent records and MongoDB GridFS for private Physio degree PDFs. Local development defaults to MongoDB at `mongodb://127.0.0.1:27017`.

## Folder structure

- `server/server.mjs` — API routes, authentication, profile updates, visits, appointments and protected document downloads.
- `server/database.mjs` — MongoDB connection, collections, indexes and GridFS bucket.
- `server/mailer.mjs` — real SMTP email delivery with a safe development fallback.
- `degree_documents.files` / `degree_documents.chunks` — private Physio degree PDFs stored through GridFS.
- `src/features/auth/api.js` — frontend API client and session-token handling.
- `.env.example` — MongoDB and SMTP configuration template.

## Start locally

Ensure MongoDB is running at `localhost:27017`. The default local settings are:

```text
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=getyourphysio
API_PORT=8787
```

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

## One-time migration from the legacy SQLite data

If `server/data/getyourphysio.sqlite` contains existing users, Super Users, bookings or degree documents, and the target MongoDB database is empty, run:

```powershell
npm run migrate:sqlite
```

The migration copies relationships to MongoDB ObjectIds and uploads existing Physio PDFs to GridFS. It refuses to run when the target MongoDB collections already contain records. The SQLite database and upload files remain untouched as a backup.

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
- `GET /api/admin/physios/:id/degree-document`
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
- protected download access to each Physio's GridFS degree PDF;
- all Patient booking requests with contact and care information;
- a form to create a booking for a selected Patient and assign it to any registered Physio;
- location filtering by city, state, PIN code or address;
- booking status filtering and updates;
- preferred appointment date/time updates;
- Physio reassignment from the Bookings table;
- Physio credential status changes between Pending, Verified and Rejected;
- a tailored email to the Physio whenever their credential status changes.

In production, a credential status change is rolled back if SMTP delivery fails. This prevents the Admin dashboard from showing a new status when the Physio notification could not be sent. In local development without SMTP, the notification is printed in the backend terminal.

An Admin-created booking is stored once in `appointments` with both the Patient user ID and assigned Physio user ID. The Patient dashboard shows the assigned Physio's name, and the selected Physio dashboard shows that Patient and booking. Changing the assignment in Admin moves the booking from the old Physio dashboard to the newly assigned Physio dashboard.

See `EMAIL_OTP_SETUP.md` for email OTP and SMTP setup.
