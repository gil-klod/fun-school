import { GameProgress } from "@/models/GameProgress";
import { UserAnalytics, type GameStat, type SubjectStat } from "@/models/UserAnalytics";
import { getGameLabel, getSubjectLabel } from "@/lib/games";
import OpenAI from "openai";

function accuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export async function computeAnalytics(userId: string) {
  const progresses = await GameProgress.find({ userId });

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
    .map((g) => getGameLabel(g.subjectId, g.gameId));

  const weaknesses = playedGames
    .filter((g) => g.accuracy < 60 && g.correct + g.wrong >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((g) => getGameLabel(g.subjectId, g.gameId));

  const subjectStrengths = subjectStats
    .filter((s) => s.accuracy >= 70 && s.correct + s.wrong >= 5)
    .map((s) => getSubjectLabel(s.subjectId));

  const subjectWeaknesses = subjectStats
    .filter((s) => s.accuracy < 60 && s.correct + s.wrong >= 5)
    .map((s) => getSubjectLabel(s.subjectId));

  const allStrengths = [...new Set([...subjectStrengths, ...strengths])];
  const allWeaknesses = [...new Set([...subjectWeaknesses, ...weaknesses])];

  let aiFeedback = buildTemplateFeedback(allStrengths, allWeaknesses, subjectStats);
  let recommendations = buildRecommendations(allWeaknesses);

  if (process.env.OPENAI_API_KEY && playedGames.length >= 3) {
    try {
      const ai = await generateAIFeedback({
        name: "",
        subjectStats,
        gameStats: playedGames,
        strengths: allStrengths,
        weaknesses: allWeaknesses,
      });
      aiFeedback = ai.feedback;
      recommendations = ai.recommendations;
    } catch (err) {
      console.error("AI analytics failed:", err);
    }
  }

  return UserAnalytics.findOneAndUpdate(
    { userId },
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

function buildTemplateFeedback(
  strengths: string[],
  weaknesses: string[],
  subjectStats: SubjectStat[]
) {
  if (subjectStats.length === 0) {
    return "Start playing games to get personalized feedback! 🎮";
  }

  const parts: string[] = [];
  if (strengths.length > 0) {
    parts.push(`💪 You're doing great in: ${strengths.join(", ")}.`);
  }
  if (weaknesses.length > 0) {
    parts.push(`📚 Keep practicing: ${weaknesses.join(", ")}.`);
  }
  if (parts.length === 0) {
    parts.push("You're making good progress! Keep playing to discover your strengths.");
  }
  return parts.join(" ");
}

function buildRecommendations(weaknesses: string[]) {
  if (weaknesses.length === 0) {
    return ["Try a new game you haven't played yet!", "Challenge yourself with a higher streak!"];
  }

  return weaknesses.map((w) => `Practice ${w} for 10 minutes today`);
}

async function generateAIFeedback(data: {
  name: string;
  subjectStats: SubjectStat[];
  gameStats: GameStat[];
  strengths: string[];
  weaknesses: string[];
}) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a friendly tutor for Israeli 3rd grade students (age 8-9). 
Analyze their learning game stats and give encouraging feedback in simple English with some Hebrew.
Return JSON: { "feedback": "2-3 sentence summary", "recommendations": ["tip1", "tip2", "tip3"] }
Be positive, specific, and kid-friendly.`,
      },
      {
        role: "user",
        content: JSON.stringify(data),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { feedback?: string; recommendations?: string[] };

  return {
    feedback: parsed.feedback ?? buildTemplateFeedback(data.strengths, data.weaknesses, data.subjectStats),
    recommendations: parsed.recommendations ?? buildRecommendations(data.weaknesses),
  };
}
