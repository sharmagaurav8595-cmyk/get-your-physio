# Email OTP and SMTP setup

## Is email OTP free?

OTP generation is free because the application generates the six-digit number itself. Delivering that OTP to an email inbox requires an email sender.

You can start free using:

- Gmail SMTP for local testing and very small usage;
- a transactional email provider such as Resend for a real deployed website.

Resend's current free plan includes 3,000 transactional emails per month with a 100-email daily limit. Provider limits can change, so check the provider's pricing before deployment.

## What is SMTP?

SMTP means Simple Mail Transfer Protocol. It is the standard connection your backend uses to hand an outgoing email to Gmail, Resend, Brevo or another mail provider.

The flow is:

1. The website asks the backend for an OTP.
2. The backend generates and stores a hashed OTP with an expiry.
3. Nodemailer connects to the configured SMTP server.
4. The SMTP provider delivers the message.
5. The user enters the OTP and the backend verifies it.

The browser never receives your SMTP password or API key.

`SMTP_USER` is only the sender account used to authenticate with the email provider. It is not the OTP recipient. For login and registration, the backend sends the OTP to the email address entered by that Patient, Physio, or Admin. When SMTP is configured successfully, the OTP is not returned to the browser.

## Option A: Gmail SMTP for local testing

1. Use a Gmail account dedicated to the project if possible.
2. Enable 2-Step Verification on that Google account.
3. Open Google Account → Security → App passwords.
4. Create an app password for the website.
5. Copy `.env.example` to a new file named `.env`.
6. Add:

```text
API_PORT=8787
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youraccount@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=GetYourPhysio.in <youraccount@gmail.com>
```

Use the generated App Password, not the normal Gmail password. Google requires 2-Step Verification before App Passwords can be created. Some managed work/school accounts may not expose App Passwords.

Gmail is convenient for local testing, but a personal mailbox is not the best long-term sender for production OTP traffic.

## Option B: Resend SMTP for production

1. Create a Resend account.
2. Add a domain you control and complete its DNS verification.
3. Create a Resend API key.
4. Copy `.env.example` to `.env`.
5. Add:

```text
API_PORT=8787
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_resend_api_key
SMTP_FROM=GetYourPhysio.in <otp@your-verified-domain.com>
```

Resend also supports STARTTLS on port 587 with `SMTP_SECURE=false`.

## Start and test

Restart the backend after changing `.env`:

```powershell
npm run server
```

For local development, you can start both the backend and frontend in one terminal:

```powershell
npm run dev:all
```

Then open the login page and request an OTP. The health endpoint reports the configured email mode:

```text
http://127.0.0.1:8787/api/health
```

When SMTP is configured correctly, `emailMode` remains `smtp` and the OTP is delivered to the entered email.

For signup verification, use an email that does not already have an account for the selected role. If the backend is not running, no OTP request can be processed. If Gmail rejects a delivery, the backend now removes that failed OTP attempt so the user can retry immediately after the SMTP setting is corrected.

## Important security rules

- Never put SMTP credentials in React files or `VITE_` variables.
- Never commit `.env`; it is already ignored by Git.
- Never share the App Password or Resend API key in chat or screenshots.
- Use a dedicated sending domain such as `otp.getyourphysio.in` for production.
- Configure SPF and DKIM using the records supplied by the email provider.
- Rotate the credential immediately if it is exposed.

Official references:

- Google App Passwords: https://support.google.com/mail/answer/185833
- Google SMTP configuration: https://support.google.com/a/answer/176600
- Resend SMTP: https://resend.com/docs/send-with-smtp
- Resend pricing: https://resend.com/pricing
