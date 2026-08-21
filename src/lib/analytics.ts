import { UserAnalytics, type GameStat, type SubjectStat } from "@/models/UserAnalytics";
import {
  gameStrengthKey,
  subjectStrengthKey,
} from "@/lib/analyticsKeys";
import { toStudentObjectId } from "@/lib/students/objectId";
import { buildStatsFromProgressRecords } from "@/lib/progressStats";
import { listGameProgressForStudent } from "@/lib/progressServer";
import OpenAI from "openai";

export async function computeAnalytics(studentId: string, userId?: string) {
  const studentObjectId = toStudentObjectId(studentId);
  if (!studentObjectId) {
    throw new Error("Invalid studentId");
  }

  const progresses = userId
    ? await listGameProgressForStudent(studentId, userId)
    : await listGameProgressForStudent(studentId, "");

  const { subjectStats, gameStats } = buildStatsFromProgressRecords(progresses);
  const playedGames = gameStats.filter((g) => (g.correct ?? 0) + (g.wrong ?? 0) > 0);

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
    { studentId: studentObjectId },
    {
      studentId: studentObjectId,
      subjectStats,
      gameStats,
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      aiFeedback,
      recommendations,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  ).lean();
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
