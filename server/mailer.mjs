import nodemailer from "nodemailer";

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const normalizeRecipient = (email) => String(email || "").trim().toLowerCase();
const maskEmail = (email) => email.replace(/^(.)(.*)(@.*)$/, (_match, first, middle, domain) => `${first}${"*".repeat(Math.min(5, middle.length))}${domain}`);
const smtpUser = normalizeRecipient(process.env.SMTP_USER);
const isGmailSmtp = String(process.env.SMTP_HOST || "").toLowerCase() === "smtp.gmail.com";
const sender = isGmailSmtp
  ? `GetYourPhysio.in <${smtpUser}>`
  : process.env.SMTP_FROM || `GetYourPhysio.in <${smtpUser}>`;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendOtpEmail({ email, otp, purpose }) {
  const recipient = normalizeRecipient(email);
  if (!/^\S+@\S+\.\S+$/.test(recipient)) throw new Error("A valid OTP recipient email is required.");

  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS before sending production OTPs.");
    }
    console.info(`[GetYourPhysio OTP] ${recipient}: ${otp} (${purpose})`);
    return { delivered: false, mode: "development", recipient: maskEmail(recipient) };
  }

  const delivery = await transporter.sendMail({
    from: sender,
    to: recipient,
    subject: "Your GetYourPhysio.in verification code",
    text: `Your verification code is ${otp}. It expires in 10 minutes. Do not share this code.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#14324a">
        <h2 style="color:#0c4775">GetYourPhysio.in</h2>
        <p>Use this one-time code to continue:</p>
        <div style="font-size:30px;font-weight:800;letter-spacing:8px;padding:18px;background:#eef8f8;border-radius:10px;text-align:center">${otp}</div>
        <p style="color:#657b8c">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>`,
  });

  if (!delivery.accepted?.map(normalizeRecipient).includes(recipient)) {
    throw new Error(`SMTP did not accept the recipient ${maskEmail(recipient)}.`);
  }

  console.info(`[GetYourPhysio] OTP email ${delivery.messageId} accepted for ${maskEmail(recipient)}.`);
  return { delivered: true, mode: "smtp", recipient: maskEmail(recipient) };
}
