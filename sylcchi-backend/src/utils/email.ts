import nodemailer from "nodemailer";
import { envVars } from "../config/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  if (!envVars.SMTP_HOST || !envVars.SMTP_USER || !envVars.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    secure: envVars.SMTP_SECURE,
    auth: {
      user: envVars.SMTP_USER,
      pass: envVars.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const mailer = getTransporter();

  if (!mailer) {
    if (envVars.NODE_ENV === "development") {
      console.log("[Email disabled]", payload);
    }
    return;
  }

  await mailer.sendMail({
    from: envVars.SMTP_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}
