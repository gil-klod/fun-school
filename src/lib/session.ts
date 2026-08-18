/** Endless games show progress as a 10-question session */
export const SESSION_SIZE = 10;

export function sessionQuestion(round: number): number {
  return ((round - 1) % SESSION_SIZE) + 1;
}
