import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  if (!resend) {
    console.log("[dev] Verification link:", verifyUrl);
    return { dev: true, verifyUrl };
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Fun School <onboarding@resend.dev>",
    to: email,
    subject: "Verify your Fun School account",
    html: `
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
    `,
  });

  return { dev: false };
}
