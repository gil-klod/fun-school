import { subjects } from "./subjects";

export interface GameRef {
  subjectId: string;
  gameId: string;
  title: string;
  titleHe: string;
  href: string;
  emoji: string;
}

export function getAllGames(): GameRef[] {
  return subjects.flatMap((subject) =>
    subject.games.map((game) => ({
      subjectId: subject.id,
      gameId: game.id,
      title: game.title,
      titleHe: game.titleHe ?? "",
      href: game.href,
      emoji: game.emoji,
    }))
  );
}

export function getGameLabel(subjectId: string, gameId: string): string {
  const game = getAllGames().find((g) => g.subjectId === subjectId && g.gameId === gameId);
  return game?.title ?? gameId;
}

export function getSubjectLabel(subjectId: string): string {
  const subject = subjects.find((s) => s.id === subjectId);
  return subject?.title ?? subjectId;
}
