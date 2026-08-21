import type { GameStat, SubjectStat } from "@/models/UserAnalytics";

export interface ProgressRecord {
  subjectId: string;
  gameId: string;
  correct?: number;
  wrong?: number;
  score?: number;
  status?: string;
  difficulty?: number;
  lastPlayedAt?: Date | string;
}

function accuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function buildStatsFromProgressRecords(progresses: ProgressRecord[]) {
  const subjectMap = new Map<string, SubjectStat>();
  const gameMap = new Map<string, GameStat>();

  for (const p of progresses) {
    const correct = Number(p.correct ?? 0);
    const wrong = Number(p.wrong ?? 0);
    const score = Number(p.score ?? 0);
    if (correct + wrong === 0) continue;

    const sub = subjectMap.get(p.subjectId) ?? {
      subjectId: p.subjectId,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      gamesPlayed: 0,
    };
    sub.correct += correct;
    sub.wrong += wrong;
    sub.gamesPlayed += 1;
    sub.accuracy = accuracy(sub.correct, sub.wrong);
    subjectMap.set(p.subjectId, sub);

    const gameKey = `${p.subjectId}:${p.gameId}`;
    const game = gameMap.get(gameKey) ?? {
      subjectId: p.subjectId,
      gameId: p.gameId,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      score: 0,
    };
    game.correct += correct;
    game.wrong += wrong;
    game.score = Math.max(game.score, score);
    game.accuracy = accuracy(game.correct, game.wrong);
    gameMap.set(gameKey, game);
  }

  return {
    subjectStats: Array.from(subjectMap.values()),
    gameStats: Array.from(gameMap.values()),
  };
}

export function hasAnsweredGames(gameStats: GameStat[]) {
  return gameStats.some((g) => (g.correct ?? 0) + (g.wrong ?? 0) > 0);
}

export type { GameStat, SubjectStat };
