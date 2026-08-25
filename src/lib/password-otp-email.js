/*
 * Markup for the password-reset OTP email.
 *
 * Email clients are not browsers: Outlook ignores most modern CSS, Gmail
 * strips <style> blocks in some views, and flexbox/grid are unreliable. So
 * this is deliberately built the old-fashioned way — nested tables, inline
 * styles, and web-safe fonts only. There are no external images or
 * stylesheets, so it renders identically when remote content is blocked.
 */

const BRAND = "Nepaquarry";
const SUPPORT_EMAIL = "billing@nepaquarry.com";

// Escapes text interpolated into the HTML. The display name comes from the
// database, so it must never be able to inject markup into the message.
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// The code is rendered one digit per cell so it stays legible and evenly
// spaced; letter-spacing alone is applied inconsistently across clients.
const renderDigits = (otp) =>
  String(otp)
    .split("")
    .map(
      (digit) => `
                          <td align="center" style="padding:0 4px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td align="center" style="width:40px;height:52px;background-color:#ffffff;border:1px solid #dbe5f0;border-radius:8px;font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:700;color:#0f172a;">${escapeHtml(digit)}</td>
                              </tr>
                            </table>
                          </td>`,
    )
    .join("");

const buildPasswordOtpEmail = ({ name, otp, expiryMinutes }) => {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  // Leading with the code lets most clients surface it as an autofill
  // suggestion straight from the notification.
  const subject = `${otp} is your ${BRAND} password reset code`;

  // Plain-text alternative for clients that refuse HTML.
  const text = [
    `Hello ${name},`,
    "",
    `Your ${BRAND} password reset code is: ${otp}`,
    "",
    `This code expires in ${expiryMinutes} minutes and can only be used once.`,
    "",
    "If you did not request a password reset, you can safely ignore this email — your password will not change.",
    "",
    `Need help? Contact ${SUPPORT_EMAIL}`,
    `${BRAND} — Company operations portal`,
  ].join("\n");

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${BRAND} password reset code</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f8fc;">
  <!-- Preheader: the snippet shown in the inbox list, hidden in the body. -->
  <div style="display:none;font-size:1px;color:#f5f8fc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Your ${BRAND} password reset code is ${safeOtp}. It expires in ${expiryMinutes} minutes.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f8fc;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e8eef6;border-radius:14px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1e40af;padding:26px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">
                    ${BRAND}
                  </td>
                  <td align="right" style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#bfdbfe;text-transform:uppercase;letter-spacing:1.2px;">
                    Account recovery
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 8px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
              <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;color:#0f172a;">Reset your password</h1>
              <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#334155;">Hello ${safeName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                Use the verification code below to continue resetting your ${BRAND} password.
              </p>
            </td>
          </tr>

          <!-- Code -->
          <tr>
            <td align="center" style="padding:0 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fbff;border:1px solid #e8eef6;border-radius:12px;">
                <tr>
                  <td align="center" style="padding:22px 12px 8px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#1e40af;">
                    Verification code
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 12px 18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>${renderDigits(otp)}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 16px 20px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#64748b;">
                    Expires in ${expiryMinutes} minutes &middot; single use
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:22px 32px 4px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fffbeb;border-left:3px solid #f59e0b;border-radius:6px;">
                <tr>
                  <td style="padding:12px 14px;font-size:13px;line-height:1.6;color:#78350f;">
                    <strong>Did not request this?</strong> You can safely ignore this email &mdash; your password will not change, and nobody can reset it without this code.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 30px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
              <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#64748b;">
                Need help? Contact
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb;text-decoration:none;">${SUPPORT_EMAIL}</a>.
              </p>
              <p style="margin:12px 0 0;padding-top:14px;border-top:1px solid #e8eef6;font-size:11px;line-height:1.6;color:#94a3b8;">
                This is an automated message from ${BRAND}, your company operations portal.
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
};

module.exports = { buildPasswordOtpEmail };
