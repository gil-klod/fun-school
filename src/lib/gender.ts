export type UserGender = "male" | "female";

export const USER_GENDERS: UserGender[] = ["male", "female"];

export function isUserGender(value: unknown): value is UserGender {
  return value === "male" || value === "female";
}

/** Default for legacy users without gender stored. */
export function normalizeGender(value: unknown): UserGender {
  return value === "female" ? "female" : "male";
}
