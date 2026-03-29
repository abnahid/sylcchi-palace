import { envVars } from "../config/env";

type OtpTemplateType =
  | "email-verification"
  | "sign-in"
  | "forget-password"
  | "checkin";

type OtpTemplateInput = {
  recipientName?: string | null;
  otp: string;
  type: OtpTemplateType;
  expiresInMinutes: number;
};

type OtpTemplateContent = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTypeCopy(type: OtpTemplateType): { title: string; action: string } {
  if (type === "email-verification") {
    return {
      title: "Verify Your Email",
      action: "Use this code to verify your email address",
    };
  }

  if (type === "sign-in") {
    return {
      title: "Complete Your Sign-In",
      action: "Use this code to finish signing in",
    };
  }

  if (type === "forget-password") {
    return {
      title: "Reset Your Password",
      action: "Use this code to reset your password",
    };
  }

  return {
    title: "Confirm Your Check-In",
    action: "Use this code to verify your online check-in",
  };
}

export function buildOtpEmailTemplate(
  input: OtpTemplateInput,
): OtpTemplateContent {
  const safeName = escapeHtml(
    (input.recipientName ?? "there").trim() || "there",
  );
  const safeOtp = escapeHtml(input.otp.trim());
  const { title, action } = getTypeCopy(input.type);
  const supportEmail = escapeHtml(envVars.SUPPORT_EMAIL);
  const expiry = Math.max(1, Math.floor(input.expiresInMinutes));

  const subject = `${title} - Sylcchi Palace`;

  const text = [
    `Hello ${safeName},`,
    "",
    `${action}: ${safeOtp}`,
    `This code expires in ${expiry} minutes.`,
    "",
    "For your security:",
    "- Never share this code with anyone.",
    "- Sylcchi Palace will never ask for this code by phone or chat.",
    "",
    `Need help? Contact us at ${envVars.SUPPORT_EMAIL}`,
    "",
    "Sylcchi Palace",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="display:none;font-size:1px;color:#f5f7fb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${action}. Expires in ${expiry} minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Sylcchi Palace</p>
                <p style="margin:6px 0 0 0;font-size:12px;color:#6b7280;">Secure account notification</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:14px;">Hello ${safeName},</p>
                <h1 style="margin:0 0 10px 0;font-size:22px;line-height:1.3;color:#111827;">${title}</h1>
                <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#374151;">${action}.</p>

                <div style="margin:0 0 18px 0;padding:16px;border:1px dashed #9ca3af;border-radius:10px;background-color:#f9fafb;text-align:center;">
                  <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;">One-Time Code</p>
                  <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.2em;color:#111827;">${safeOtp}</p>
                </div>

                <p style="margin:0 0 14px 0;font-size:14px;color:#374151;">This code expires in <strong>${expiry} minutes</strong>.</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px 0;">
                  <tr>
                    <td style="padding:12px;border-radius:8px;background-color:#f3f4f6;">
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#4b5563;">
                        Security tip: never share this code. Sylcchi Palace support will never ask for OTP codes.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                  Need help? Contact
                  <a href="mailto:${supportEmail}" style="color:#1d4ed8;text-decoration:none;">${supportEmail}</a>
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:14px 8px;text-align:center;">
                <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.5;">
                  This is an automated security email from Sylcchi Palace.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return { subject, html, text };
}
