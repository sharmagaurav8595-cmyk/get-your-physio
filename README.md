# GetYourPhysio.in

GetYourPhysio is a Vite + React frontend with a Node.js + Express backend. The frontend is already hosted through GitHub and Vercel. The application now uses MongoDB everywhere. This guide explains the local setup and the next deployment phase:

- run against local MongoDB during development and a free MongoDB Atlas cluster after deployment;
- store private Physio degree PDFs in MongoDB GridFS;
- deploy the Node.js backend on Render's free web-service tier;
- connect the existing Vercel frontend to the Render backend;
- configure local, Render, Atlas, and Vercel environment settings safely.

> [!IMPORTANT]
> **Current code status:** MongoDB migration is implemented. Users, Super Users, profiles, OTP challenges, verification tokens, sessions, visits, and appointments use MongoDB collections. Physio degree PDFs use the `degree_documents` GridFS bucket. Local development defaults to `mongodb://127.0.0.1:27017`.

## Recommended free architecture

```text
User
  |
  v
Vercel (React frontend)
  |
  | /api/* rewrite
  v
Render Free Web Service (Node.js + Express API)
  |
  +---- MongoDB collections: users, profiles, OTPs, sessions, bookings, etc.
  |
  +---- MongoDB GridFS: private Physio degree PDFs
             |
             v
        MongoDB Atlas Free cluster
```

| Part | Recommended service | Free-tier use |
| --- | --- | --- |
| React frontend | Vercel | Already deployed |
| Node.js backend | Render Free Web Service | Suitable for a demo, MVP, or low-traffic project |
| Database | MongoDB Atlas Free cluster (formerly M0) | 0.5 GB total storage, one free cluster per Atlas project |
| Physio documents | GridFS inside the same Atlas database | Uses the Atlas cluster's 0.5 GB storage |
| OTP email | Resend SMTP or Gmail SMTP | Keep the existing Nodemailer integration |

MongoDB Atlas Free clusters do not expire, although Atlas can automatically pause an inactive free cluster after 30 days with no connections. Render's free backend sleeps after 15 minutes without inbound traffic and may take about one minute to wake up. These limitations are acceptable for testing and an early MVP, but not ideal for a time-sensitive production login flow.

## Why MongoDB and GridFS are used

At present:

- `server/database.mjs` connects through the official MongoDB Node.js driver;
- `server/server.mjs` uses asynchronous MongoDB collection operations;
- Multer keeps an upload in memory only while it is validated and streams it into GridFS;
- the server uses `PORT` on hosting platforms, falls back to `API_PORT` locally, and listens on `0.0.0.0`;
- the frontend calls relative URLs such as `/api/auth/register`.

Render Free Web Services have an **ephemeral filesystem**, so persistent application data and uploaded PDFs are intentionally stored in MongoDB instead of Render's local filesystem.

## Why GridFS for degree documents

MongoDB has a 16 MiB BSON document-size limit. This project's upload limit is 3 MiB. GridFS is used because it:

- stores files in chunks instead of loading the complete file into one normal document;
- keeps file metadata and binary content in MongoDB;
- supports streaming uploads and protected downloads;
- avoids depending on Render's temporary local disk;
- allows the upload limit to increase later without redesigning storage.

Use a dedicated bucket name such as `degree_documents`. MongoDB will then create:

- `degree_documents.files` for filename, MIME type, upload date, size, and custom metadata;
- `degree_documents.chunks` for the binary PDF chunks.

The Physio profile should store only a reference such as:

```js
{
  degreeFileId: ObjectId("..."),
  degreeFileName: "bpt-degree.pdf",
  credentialStatus: "pending"
}
```

The PDF must **not** be placed in a public URL or sent inside normal profile/dashboard JSON. Continue serving it only through an authenticated route such as `GET /api/me/degree-document`, stream it from GridFS, set `Content-Type: application/pdf`, and use the original filename only after safely encoding the download header.

## Implemented MongoDB architecture

The following migration is already implemented in the repository.

### 1. MongoDB Node.js driver

Install the official driver:

```powershell
npm install mongodb
```

`server/database.mjs` now:

- reads `MONGODB_URI` and `MONGODB_DB_NAME`;
- creates one reusable `MongoClient`;
- connects before `app.listen(...)`;
- exports named collections and a `GridFSBucket`;
- creates required indexes during startup;
- fails startup immediately when the database cannot be reached.

The Atlas connection string must stay on the backend. Never use `VITE_MONGODB_URI`, and never put it in React code.

### 2. Convert SQL tables to collections

A practical mapping for this project is:

| Current SQLite table | MongoDB collection | Important indexes |
| --- | --- | --- |
| `users` | `users` | unique `{ email: 1, role: 1 }` |
| `admins` | `admins` | unique `{ email: 1 }` |
| `profiles` | `profiles` | unique `{ userId: 1 }`, `{ credentialStatus: 1 }` |
| `otp_challenges` | `otpChallenges` | `{ email: 1, role: 1, purpose: 1, createdAt: -1 }`, TTL on `expiresAt` |
| `verification_tokens` | `verificationTokens` | unique `{ tokenHash: 1 }`, TTL on `expiresAt` |
| `sessions` | `sessions` | unique `{ tokenHash: 1 }`, TTL on `expiresAt` |
| `admin_sessions` | `adminSessions` | unique `{ tokenHash: 1 }`, TTL on `expiresAt` |
| `visits` | `visits` | `{ physioUserId: 1, scheduledAt: -1 }` |
| `appointments` | `appointments` | `{ patientUserId: 1, scheduledAt: 1 }`, `{ physioUserId: 1, scheduledAt: 1 }` |

Store dates as MongoDB `Date` values, not ISO strings, wherever possible. TTL indexes work with BSON dates. Keep OTP codes, verification tokens, and session tokens hashed exactly as the current backend does.

MongoDB IDs are `ObjectId` values, so remove SQL-specific conversions such as `Number(req.params.id)`. API responses can serialize IDs to strings.

### 3. GridFS document upload

The backend uses `multer.memoryStorage()` with a 3 MiB limit. On registration it:

1. accept only a PDF and enforce the size limit;
2. verify both MIME type and the `%PDF-` file signature;
3. upload the PDF to the `degree_documents` GridFS bucket;
4. store the resulting GridFS file `_id` on the Physio profile;
5. if profile creation fails after the GridFS upload, delete the orphaned GridFS file;
6. mark the credential status as `pending`.

GridFS does not support multi-document transactions, so explicit orphan cleanup is important.

The 3 MiB limit keeps 50–60 Physio documents comfortably within the free Atlas cluster's 0.5 GB total storage in normal use. PDF compression and an Admin retention policy are still recommended. If document volume grows, move files to object storage such as Cloudinary, S3, or Cloudflare R2 and keep only their private object keys in MongoDB.

### 4. Convert route handlers to async database calls

Authentication, Admin, dashboard, appointment, profile, and visit routes are asynchronous and await MongoDB collection operations.

Use atomic MongoDB operations where possible. For example:

- `$set` for profile and booking updates;
- `findOneAndUpdate` when the updated document must be returned;
- TTL indexes for expired OTP/session cleanup;
- unique indexes to prevent duplicate accounts.

Do not assume that a MongoDB transaction also covers GridFS. Upload cleanup must be handled separately.

### 5. Make Express compatible with Render

The server must use Render's assigned `PORT` and listen on all interfaces:

```js
const port = Number(process.env.PORT || process.env.API_PORT || 8787);

await connectDatabase();

app.listen(port, "0.0.0.0", () => {
  console.info(`GetYourPhysio API listening on port ${port}`);
});
```

Add a production start script:

```json
{
  "scripts": {
    "start": "node server/server.mjs"
  }
}
```

The health route should ideally confirm the app and database state without returning secrets:

```json
{
  "ok": true,
  "service": "getyourphysio-api",
  "database": "connected",
  "emailMode": "smtp"
}
```

### 6. Update the Admin creation script

`server/create-admin.mjs` uses MongoDB and `MONGODB_URI`. Render's free service does not provide shell access, so create the first Admin from the local project using the same production Atlas connection:

```powershell
$env:MONGODB_URI="mongodb+srv://..."
$env:MONGODB_DB_NAME="getyourphysio"
npm run create-admin -- admin@getyourphysio.in "GetYourPhysio Super Admin"
```

Do not paste the real URI into terminal screenshots, source code, GitHub issues, or chat. After creating the Admin, close that terminal or remove the temporary variables.

## Step 1: Create a free MongoDB Atlas database

1. Open [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account.
2. Create a new project, for example `GetYourPhysio`.
3. Select **Create a deployment**.
4. Choose the **Free** cluster option, formerly called `M0`.
5. Choose a provider and the free region closest to the Render region you plan to use. Keeping them geographically close reduces latency.
6. Name the cluster, for example `getyourphysio-cluster`, and create it.
7. In **Security → Database Access**, create a database user.
8. Give the user only the permissions the application needs, normally `readWrite` on the `getyourphysio` database. Avoid using an Atlas project-owner credential inside the app.
9. Generate a long password. An alphanumeric password is easiest for a connection URI. If it contains URI-special characters such as `@`, `:`, `/`, `?`, or `#`, percent-encode the password.
10. Save the username and password in a password manager.

### Configure Atlas network access

The safer setup for Render is:

1. Create the Render service first if necessary.
2. In Render, open the service.
3. Open **Connect → Outbound**.
4. Copy every outbound IP range shown for that service/region.
5. In Atlas, open **Security → Network Access → Add IP Address**.
6. Add each Render CIDR range.
7. Also add your current public IP with `/32` while running the backend or Admin script locally.

For a quick test, Atlas allows `0.0.0.0/0` (**Allow access from anywhere**), but that exposes the database network endpoint to the internet. If used temporarily, keep a strong unique database password, least-privilege database user, TLS connection string, and replace the wildcard with Render's outbound ranges as soon as possible.

### Copy the connection string

1. In Atlas, open the cluster and select **Connect**.
2. Choose **Drivers** and then **Node.js**.
3. Copy the `mongodb+srv://...` connection string.
4. Replace `<db_password>` locally or in Render's secret value.
5. Include the database name:

```text
mongodb+srv://APP_USER:APP_PASSWORD@YOUR_CLUSTER.mongodb.net/getyourphysio?retryWrites=true&w=majority
```

Use the exact hostname and options supplied by Atlas. The example above is a shape, not a value to copy literally.

## Step 2: Configure local environment variables

Keep `.env` uncommitted; it is already ignored by Git. With MongoDB running locally on port `27017`, the local `.env` should look like:

```dotenv
NODE_ENV=development
API_PORT=8787

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=getyourphysio

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_real_api_key
SMTP_FROM=GetYourPhysio.in <otp@your-verified-domain.com>
```

When moving to Atlas, only replace `MONGODB_URI` with the Atlas `mongodb+srv://...` connection string. Keep the same `MONGODB_DB_NAME`.

Rules:

- no spaces around `=`;
- no quotes unless the value genuinely requires them;
- never commit `.env`;
- never prefix backend secrets with `VITE_`;
- restart the backend after changing `.env`;
- rotate any credential immediately if it is exposed.

Run locally:

```powershell
npm install
npm run dev:all
```

The Vite development proxy already forwards `/api` to `http://127.0.0.1:8787`.

## Step 3: Test MongoDB locally before deployment

Do not deploy until all of these work against the configured local MongoDB database:

1. `GET http://127.0.0.1:8787/api/health` returns HTTP 200.
2. Patient registration creates `users` and `profiles` records.
3. Physio registration uploads a real PDF to `degree_documents.files` and `degree_documents.chunks`.
4. The Physio profile stores the GridFS file ID, not a local path.
5. Login works after restarting the backend, proving sessions are not local-memory only.
6. `GET /api/me/degree-document` streams the correct private PDF.
7. An unauthenticated request to the same document route returns 401.
8. Admin creation, Admin login, credential status changes, booking assignment, and dashboards work.
9. Expired OTP and session documents are removed by TTL indexes.

In Atlas, use **Browse Collections** only for verification. Do not manually edit production authentication records.

## Step 4: Deploy the Node.js backend free on Render

Render is the recommended free option for this project because it can run the existing long-lived Express server directly.

### Prepare the GitHub repository

Before connecting Render:

1. test the MongoDB implementation locally;
2. ensure `package.json` contains `"start": "node server/server.mjs"`;
3. ensure the backend reads `process.env.PORT`;
4. ensure it listens on `0.0.0.0`;
5. ensure `.env`, `server/data/`, and `server/uploads/` are not committed;
6. push the changes to GitHub.

### Create the Render Web Service

1. Sign in at [Render](https://dashboard.render.com/).
2. Select **New → Web Service**.
3. Connect the same GitHub repository used by Vercel.
4. Select the production branch, normally `main`.
5. Use these settings:

| Render field | Value |
| --- | --- |
| Name | `getyourphysio-api` |
| Language / Runtime | `Node` |
| Root Directory | leave blank because `package.json` is at repository root |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | `Free` |
| Health Check Path | `/api/health` |
| Auto-Deploy | `Yes` |

6. Add the environment variables listed below.
7. Deploy.
8. Copy the generated URL, for example `https://getyourphysio-api.onrender.com`.
9. Open `https://getyourphysio-api.onrender.com/api/health`.

Do not add a trailing slash when saving the backend base URL elsewhere.

### Render environment variables

Add these in **Render service → Environment**:

```dotenv
NODE_ENV=production
MONGODB_URI=mongodb+srv://APP_USER:APP_PASSWORD@YOUR_CLUSTER.mongodb.net/getyourphysio?retryWrites=true&w=majority
MONGODB_DB_NAME=getyourphysio
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_real_api_key
SMTP_FROM=GetYourPhysio.in <otp@your-verified-domain.com>
```

Notes:

- do **not** set `PORT`; Render injects it automatically;
- `API_PORT` is only needed for local development;
- values added to Render do not come from the repository's `.env`;
- use Render's secret environment values, not hard-coded JavaScript strings;
- redeploy or restart after changing an environment variable;
- production OTP delivery must be configured because the backend intentionally does not return OTPs in production.

## Step 5: Connect Vercel to Render

There are two valid approaches. Use **Option A** for this repository.

### Option A — recommended: Vercel rewrite

The frontend currently calls `/api/...`. The repository's `vercel.json` already sends Admin, dashboard, login, and registration route refreshes to the React SPA. After the Render backend is live, add the `/api` rewrite as the **first** rewrite without removing the existing SPA rewrites:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://getyourphysio-api.onrender.com/api/:path*"
    },
    { "source": "/login", "destination": "/index.html" },
    { "source": "/admin", "destination": "/index.html" },
    { "source": "/admin/:path*", "destination": "/index.html" },
    { "source": "/dashboard/:path*", "destination": "/index.html" },
    { "source": "/physio/:path*", "destination": "/index.html" },
    { "source": "/patient/:path*", "destination": "/index.html" }
  ]
}
```

Replace the example Render hostname with the real service hostname, commit the file, and push it. Vercel will redeploy automatically.

Benefits:

- current frontend fetch calls do not need to change;
- browser requests stay on the Vercel domain;
- no frontend API environment variable is required;
- normal browser CORS configuration is avoided because Vercel proxies the request.

Do not enable CDN caching for authentication, dashboard, Admin, or document routes. These responses are private and user-specific.

### Option B — direct browser calls with a Vite variable

Use this only if you prefer the browser to contact Render directly.

In `src/features/auth/api.js`, build URLs from:

```js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Inside request():
const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
```

In Vercel, open **Project → Settings → Environment Variables** and add:

```text
VITE_API_BASE_URL=https://getyourphysio-api.onrender.com
```

Select both **Production** and **Preview** if both deployments should use the API, then redeploy. Vite variables are embedded during the frontend build, so an environment-variable change does not affect an already-built deployment.

This option also requires backend CORS configuration. Allow only the real production and required preview origins:

```dotenv
FRONTEND_ORIGINS=https://www.your-domain.com,https://your-project.vercel.app
```

Do not use `Access-Control-Allow-Origin: *` for a private authenticated API. This project currently sends bearer tokens, so allow the `Authorization` and `Content-Type` headers and the required HTTP methods.

> `VITE_API_BASE_URL` is public by design. It may contain the public backend URL, but it must never contain MongoDB, SMTP, or other secrets.

## Step 6: Final production verification

Test in this order:

1. Open the Render health URL directly.
2. Open the Vercel URL and register a new Patient.
3. Log out and log back in using email OTP.
4. Register a new Physio with a small valid PDF.
5. Confirm the PDF exists in GridFS and no new file appears in `server/uploads/`.
6. Restart/redeploy the Render service.
7. Confirm both accounts and the document still exist.
8. Log in as Admin and verify/reject the Physio credential.
9. Create and assign a booking.
10. Verify Patient and Physio dashboards.
11. Check Render logs for database, SMTP, upload, or 5xx errors.
12. Confirm `.env` and all secret values are absent from GitHub and the frontend JavaScript bundle.

## Existing SQLite data: fresh start or migration

Choose one approach before going live.

### Fresh start

Use this if the current SQLite records and uploaded PDFs are only test data:

- deploy empty MongoDB collections;
- create the production Admin;
- register fresh Patient and Physio accounts;
- leave `server/data/` and `server/uploads/` ignored.

This is the simplest and safest option for an early project.

### Preserve existing data

Use this if current records matter:

1. Ensure the target MongoDB database is empty and local MongoDB is running.
2. Stop local writes during migration.
3. Run `npm run migrate:sqlite`.
4. The script maps old integer IDs to MongoDB ObjectIds, copies active authentication records and bookings, and uploads existing degree PDFs to GridFS.
5. Validate record counts, Super User login, document download, and booking relationships.
6. Keep the SQLite database and upload directory as a backup until production is verified.

Do not copy `degree_file_path` into MongoDB; that local path is meaningless on Render.

## Environment variable summary

| Variable | Local backend | Render backend | Vercel frontend |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `production` | not needed |
| `API_PORT` | `8787` | not needed | not needed |
| `PORT` | not needed | injected by Render | not needed |
| `MONGODB_URI` | secret | secret | **never add** |
| `MONGODB_DB_NAME` | `getyourphysio` | `getyourphysio` | not needed |
| `SMTP_HOST` | backend only | backend only | **never add** |
| `SMTP_PORT` | backend only | backend only | **never add** |
| `SMTP_SECURE` | backend only | backend only | **never add** |
| `SMTP_USER` | secret | secret | **never add** |
| `SMTP_PASS` | secret | secret | **never add** |
| `SMTP_FROM` | backend only | backend only | not needed |
| `VITE_API_BASE_URL` | optional | not needed | only for Option B |
| `FRONTEND_ORIGINS` | optional | only for Option B | not needed |

## Common deployment problems

### Render says no open port was detected

The server is still listening on `127.0.0.1`, or it is ignoring `process.env.PORT`. Bind to `0.0.0.0` and prefer Render's `PORT`.

### MongoDB connection times out

Check:

- the Render outbound ranges are in the Atlas IP access list;
- the database username and password are correct;
- special password characters are percent-encoded;
- the correct Atlas connection string is in Render;
- the Atlas free cluster is active and not paused.

### The Vercel site returns 404 for `/api/...`

If using Option A, confirm `vercel.json` is at the repository root, the Render hostname is correct, and Vercel redeployed after the commit.

If using Option B, confirm `api.js` prefixes every API path and `VITE_API_BASE_URL` was present at build time.

### The first OTP request is slow

Render Free spins down after 15 minutes without inbound traffic. The first request wakes it and can take about one minute. A health-monitoring workaround intended only to prevent sleep may violate a host's intended free-tier usage and is not a production reliability solution. Upgrade the backend when predictable response time becomes necessary.

### PDF disappears after redeploy

The code is still using `multer.diskStorage` or a local path. Successful production uploads must create records in the GridFS bucket, not `server/uploads/`.

### MongoDB free storage fills quickly

GridFS files share the Atlas cluster's 0.5 GB quota with application data and indexes. Reduce the upload limit, compress PDFs, remove rejected/obsolete documents under a defined retention policy, or move private files to object storage.

### Login works locally but production OTP never arrives

Production mode does not return the development OTP. Check Render's SMTP variables, sender-domain verification, SPF/DKIM records, Resend/Gmail logs, and Render application logs.

## Security and privacy checklist

Physio degrees contain sensitive personal and professional data. Before real users upload documents:

- publish a privacy policy and document-retention policy;
- collect only the credential data actually needed;
- use a least-privilege Atlas database user;
- restrict Atlas network access to Render's outbound ranges;
- keep all secrets out of GitHub, Vercel client variables, logs, and API responses;
- authorize every document download on the server;
- do not expose GridFS IDs as public download links;
- add rate limits to OTP and authentication endpoints;
- keep the existing hashed OTP/session-token design;
- validate actual PDF content, file size, and MIME type;
- consider malware scanning before an Admin opens an uploaded file;
- delete replaced, rejected, orphaned, and expired documents according to policy;
- enable monitoring and maintain tested backups before treating the service as production.

The Atlas Free tier is convenient for an MVP, but it does not replace an application-level backup and restore plan.

## Free-tier facts checked on 23 July 2026

Pricing and limits can change. Verify them again before deployment:

- [MongoDB Atlas: deploy a Free cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
- [MongoDB Atlas Free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)
- [MongoDB Atlas IP access lists](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)
- [MongoDB GridFS](https://www.mongodb.com/docs/manual/core/gridfs/)
- [MongoDB Node.js driver: connect to Atlas](https://www.mongodb.com/docs/drivers/node/current/connect/connection-targets/)
- [Render Free services and limitations](https://render.com/docs/free)
- [Render Node.js + Express deployment](https://render.com/docs/deploy-node-express-app)
- [Render outbound IP addresses](https://render.com/docs/outbound-ip-addresses)
- [Vercel rewrites to an external backend](https://vercel.com/docs/routing/rewrites)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vite environment variables and the `VITE_` prefix](https://vite.dev/guide/env-and-mode)

For the existing OTP provider setup, see [EMAIL_OTP_SETUP.md](./EMAIL_OTP_SETUP.md). For the current pre-Mongo backend route list, see [BACKEND.md](./BACKEND.md).
