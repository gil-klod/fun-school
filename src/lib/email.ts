const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getSender() {
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "Fun School", email: from };
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log("[dev] Verification link:", verifyUrl);
    return { dev: true, verifyUrl };
  }

  const sender = getSender();
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Fun School 🎒</h1>
      <p>Hi ${name},</p>
      <p>Welcome to Fun School! Click the button below to verify your email and start playing.</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
  `;

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email, name }],
      subject: "Verify your Fun School account",
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo email failed (${res.status}): ${body}`);
  }

  return { dev: false };
}
