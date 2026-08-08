import nodemailer from "nodemailer";

const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
const resendConfigured = Boolean(resendApiKey);
const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const normalizeRecipient = (email) => String(email || "").trim().toLowerCase();
const maskEmail = (email) => email.replace(/^(.)(.*)(@.*)$/, (_match, first, middle, domain) => `${first}${"*".repeat(Math.min(5, middle.length))}${domain}`);
const escapeHtml = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
const smtpUser = normalizeRecipient(process.env.SMTP_USER);
const isGmailSmtp = String(process.env.SMTP_HOST || "").toLowerCase() === "smtp.gmail.com";
const sender = isGmailSmtp
  ? `GetYourPhysio.in <${smtpUser}>`
  : process.env.SMTP_FROM || `GetYourPhysio.in <${smtpUser}>`;
const resendSender = process.env.EMAIL_FROM || "GetYourPhysio.in <otp@getyourphysio.in>";

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  : null;

export function getEmailMode() {
  if (resendConfigured) return "resend";
  if (smtpConfigured) return "smtp";
  return "development";
}

async function sendEmail({ recipient, subject, text, html }) {
  if (resendConfigured) {
    let response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: resendSender, to: [recipient], subject, text, html }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error.name === "TimeoutError") throw new Error("Resend email API timed out.");
      throw error;
    }

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || `Resend email API returned HTTP ${response.status}.`);
    }
    if (!result?.id) throw new Error("Resend accepted the request without returning an email ID.");
    return { mode: "resend", messageId: result.id };
  }

  if (transporter) {
    const delivery = await transporter.sendMail({ from: sender, to: recipient, subject, text, html });
    if (!delivery.accepted?.map(normalizeRecipient).includes(recipient)) {
      throw new Error(`SMTP did not accept the recipient ${maskEmail(recipient)}.`);
    }
    return { mode: "smtp", messageId: delivery.messageId };
  }

  return null;
}

export async function sendOtpEmail({ email, otp, purpose }) {
  const recipient = normalizeRecipient(email);
  if (!/^\S+@\S+\.\S+$/.test(recipient)) throw new Error("A valid OTP recipient email is required.");

  if (!resendConfigured && !transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured. Set RESEND_API_KEY or SMTP credentials before sending production OTPs.");
    }
    console.info(`[GetYourPhysio OTP] ${recipient}: ${otp} (${purpose})`);
    return { delivered: false, mode: "development", recipient: maskEmail(recipient) };
  }

  const delivery = await sendEmail({
    recipient,
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

  console.info(`[GetYourPhysio] OTP email ${delivery.messageId} accepted by ${delivery.mode} for ${maskEmail(recipient)}.`);
  return { delivered: true, mode: delivery.mode, recipient: maskEmail(recipient) };
}

export async function sendCredentialStatusEmail({ email, name, status }) {
  const recipient = normalizeRecipient(email);
  if (!/^\S+@\S+\.\S+$/.test(recipient)) {
    throw new Error("A valid Physio email address is required.");
  }

  const statusMessages = {
    verified: {
      subject: "Your GetYourPhysio profile has been verified",
      heading: "Your credentials are verified",
      message: "Your professional credentials have been reviewed and approved. Your GetYourPhysio profile is now marked as verified.",
    },
    rejected: {
      subject: "Update on your GetYourPhysio credential review",
      heading: "Your credentials need attention",
      message: "We could not verify your submitted credentials at this time. Please contact the GetYourPhysio team before submitting updated information.",
    },
    pending: {
      subject: "Your GetYourPhysio credentials are under review",
      heading: "Credential review pending",
      message: "Your professional credentials are currently marked as pending and will be reviewed by the GetYourPhysio team.",
    },
  };
  const content = statusMessages[status];
  if (!content) throw new Error("A valid credential status is required.");

  if (!resendConfigured && !transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured. Set RESEND_API_KEY or SMTP credentials before sending production emails.");
    }
    console.info(`[GetYourPhysio credential email] ${recipient}: ${status}`);
    return { delivered: false, mode: "development", recipient: maskEmail(recipient) };
  }

  const safeName = escapeHtml(name || "Physio");
  const delivery = await sendEmail({
    recipient,
    subject: content.subject,
    text: `Hello ${name || "Physio"},\n\n${content.message}\n\nGetYourPhysio.in`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:30px;color:#14324a">
        <h2 style="color:#0c4775">GetYourPhysio.in</h2>
        <p>Hello ${safeName},</p>
        <h3 style="margin-top:24px">${content.heading}</h3>
        <p style="font-size:16px;line-height:1.65;color:#4f6575">${content.message}</p>
        <p style="margin-top:28px;color:#657b8c">GetYourPhysio credential review team</p>
      </div>`,
  });

  console.info(`[GetYourPhysio] Credential ${status} email ${delivery.messageId} accepted by ${delivery.mode} for ${maskEmail(recipient)}.`);
  return { delivered: true, mode: delivery.mode, recipient: maskEmail(recipient) };
}
