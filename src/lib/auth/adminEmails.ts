import type { IUser } from "@/models/User";

/** Emails that receive admin on login (comma-separated in ADMIN_EMAILS). */
export function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "gil.klod@gmail.com";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function ensureAdminFlag(user: IUser): Promise<boolean> {
  if (user.isAdmin) return true;
  if (!getAdminEmails().has(user.email.toLowerCase())) return false;

  const { User } = await import("@/models/User");
  await User.findByIdAndUpdate(user._id, { isAdmin: true });
  return true;
}
