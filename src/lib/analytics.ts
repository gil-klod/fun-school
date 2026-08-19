import { GameProgress } from "@/models/GameProgress";
import { UserAnalytics, type GameStat, type SubjectStat } from "@/models/UserAnalytics";
import {
  gameStrengthKey,
  subjectStrengthKey,
} from "@/lib/analyticsKeys";
import OpenAI from "openai";

function accuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export async function computeAnalytics(studentId: string) {
  const progresses = await GameProgress.find({ studentId });

  const subjectMap = new Map<string, SubjectStat>();
  const gameStats: GameStat[] = [];

  for (const p of progresses) {
    const sub = subjectMap.get(p.subjectId) ?? {
      subjectId: p.subjectId,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      gamesPlayed: 0,
    };
    sub.correct += p.correct;
    sub.wrong += p.wrong;
    sub.gamesPlayed += 1;
    sub.accuracy = accuracy(sub.correct, sub.wrong);
    subjectMap.set(p.subjectId, sub);

    gameStats.push({
      subjectId: p.subjectId,
      gameId: p.gameId,
      correct: p.correct,
      wrong: p.wrong,
      accuracy: accuracy(p.correct, p.wrong),
      score: p.score,
    });
  }

  const subjectStats = Array.from(subjectMap.values());
  const playedGames = gameStats.filter((g) => g.correct + g.wrong > 0);

  const strengths = playedGames
    .filter((g) => g.accuracy >= 70 && g.correct + g.wrong >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .map((g) => gameStrengthKey(g.subjectId, g.gameId));

  const weaknesses = playedGames
    .filter((g) => g.accuracy < 60 && g.correct + g.wrong >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((g) => gameStrengthKey(g.subjectId, g.gameId));

  const subjectStrengths = subjectStats
    .filter((s) => s.accuracy >= 70 && s.correct + s.wrong >= 5)
    .map((s) => subjectStrengthKey(s.subjectId));

  const subjectWeaknesses = subjectStats
    .filter((s) => s.accuracy < 60 && s.correct + s.wrong >= 5)
    .map((s) => subjectStrengthKey(s.subjectId));

  const allStrengths = [...new Set([...subjectStrengths, ...strengths])];
  const allWeaknesses = [...new Set([...subjectWeaknesses, ...weaknesses])];

  let aiFeedback = "";
  let recommendations: string[] = [];

  if (process.env.OPENAI_API_KEY && playedGames.length >= 3) {
    try {
      const ai = await generateAIFeedback({
        subjectStats,
        gameStats: playedGames,
        strengthKeys: allStrengths,
        weaknessKeys: allWeaknesses,
      });
      aiFeedback = ai.feedback;
      recommendations = ai.recommendations;
    } catch (err) {
      console.error("AI analytics failed:", err);
    }
  }

  return UserAnalytics.findOneAndUpdate(
    { studentId },
    {
      subjectStats,
      gameStats,
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      aiFeedback,
      recommendations,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

async function generateAIFeedback(data: {
  subjectStats: SubjectStat[];
  gameStats: GameStat[];
  strengthKeys: string[];
  weaknessKeys: string[];
}) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a friendly tutor for Israeli 3rd grade students (age 8-9).
Analyze their learning game stats and give encouraging feedback.
Return JSON: { "feedback": "2-3 sentence summary", "recommendations": ["tip1", "tip2", "tip3"] }
Be positive, specific, and kid-friendly.
Write feedback and recommendations in BOTH Hebrew and English as separate objects:
{ "feedbackHe": "...", "feedbackEn": "...", "recommendationsHe": ["..."], "recommendationsEn": ["..."] }`,
      },
      {
        role: "user",
        content: JSON.stringify(data),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    feedbackHe?: string;
    feedbackEn?: string;
    recommendationsHe?: string[];
    recommendationsEn?: string[];
  };

  return {
    feedback: JSON.stringify({
      he: parsed.feedbackHe ?? "",
      en: parsed.feedbackEn ?? "",
    }),
    recommendations: [
      JSON.stringify({ he: parsed.recommendationsHe ?? [], en: parsed.recommendationsEn ?? [] }),
    ],
  };
}
