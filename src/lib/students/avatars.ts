export const STUDENT_AVATARS = [
  { id: "fox", emoji: "🦊", labelEn: "Fox", labelHe: "שועל" },
  { id: "cat", emoji: "🐱", labelEn: "Cat", labelHe: "חתול" },
  { id: "dog", emoji: "🐶", labelEn: "Dog", labelHe: "כלב" },
  { id: "panda", emoji: "🐼", labelEn: "Panda", labelHe: "פנדה" },
  { id: "lion", emoji: "🦁", labelEn: "Lion", labelHe: "אריה" },
  { id: "frog", emoji: "🐸", labelEn: "Frog", labelHe: "צפרדע" },
  { id: "unicorn", emoji: "🦄", labelEn: "Unicorn", labelHe: "חד-קרן" },
  { id: "penguin", emoji: "🐧", labelEn: "Penguin", labelHe: "פינגווין" },
  { id: "owl", emoji: "🦉", labelEn: "Owl", labelHe: "ינשוף" },
  { id: "rabbit", emoji: "🐰", labelEn: "Rabbit", labelHe: "ארנב" },
] as const;

export type StudentAvatarId = (typeof STUDENT_AVATARS)[number]["id"];

const avatarMap = new Map(STUDENT_AVATARS.map((a) => [a.id, a]));

export function isStudentAvatarId(value: unknown): value is StudentAvatarId {
  return typeof value === "string" && avatarMap.has(value as StudentAvatarId);
}

export function getAvatarEmoji(avatarId: string): string {
  return avatarMap.get(avatarId as StudentAvatarId)?.emoji ?? "🎒";
}
