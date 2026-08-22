import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const TEMPLATES_DIR = path.join(process.cwd(), "emails", "templates");

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set. Add it to .env for email delivery.`);
  }
  return value;
}

function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(
  filename: string,
  vars: Record<string, string>,
  { html }: { html: boolean }
) {
  const filePath = path.join(TEMPLATES_DIR, filename);
  let body = fs.readFileSync(filePath, "utf8");
  for (const [key, raw] of Object.entries(vars)) {
    const value = html ? escapeHtml(raw) : raw;
    body = body.replaceAll(`{{${key}}}`, value);
  }
  return body;
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export function createMailTransport() {
  const host = requireEnv("SMTP_HOST");
  const port = Number(requireEnv("SMTP_PORT"));
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Send password-reset mail from emails/templates/password-reset.{html,txt}
 * Multipart text+html + conservative headers to improve inbox placement.
 */
export async function sendPasswordResetEmail(options: {
  to: string;
  resetUrl: string;
  firstName?: string | null;
}) {
  const from = requireEnv("SMTP_FROM");
  const smtpUser = requireEnv("SMTP_USER");
  const replyTo = optionalEnv("SMTP_REPLY_TO") || smtpUser;
  const supportEmail = replyTo;
  const transport = createMailTransport();

  const greeting = options.firstName?.trim()
    ? `Hi ${options.firstName.trim()},`
    : "Hi,";

  const subject = "Reset your GlobeTrotter password";
  const vars = {
    subject,
    preheader: "Reset link for your GlobeTrotter account (expires in 1 hour).",
    greeting,
    email: options.to,
    resetUrl: options.resetUrl,
    expiresIn: "1 hour",
    supportEmail,
    year: String(new Date().getFullYear()),
  };

  const text = renderTemplate("password-reset.txt", vars, { html: false });
  const html = renderTemplate("password-reset.html", vars, { html: true });

  let messageHost = "globetrotter.local";
  try {
    messageHost = new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).hostname;
  } catch {
    // keep fallback
  }

  return transport.sendMail({
    from,
    to: options.to,
    replyTo,
    subject,
    text,
    html,
    headers: {
      "X-Entity-Ref-ID": `gt-reset-${Date.now()}`,
      "X-Mailer": "GlobeTrotter",
      Precedence: "normal",
      "Auto-Submitted": "auto-generated",
    },
    messageId: `<password-reset.${Date.now()}@${messageHost}>`,
  });
}
