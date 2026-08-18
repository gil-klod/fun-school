"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { SESSION_SIZE, sessionQuestion } from "@/lib/session";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { generateShukChallenge, buildOptions, getShukItemName } from "@/lib/data/math";

function newChallenge() {
  const c = generateShukChallenge();
  return { challenge: c, options: buildOptions(c.change) };
}

export default function ShukPage() {
  const { t, gameTitle, locale } = useLocale();
  const progress = useGameProgress({ subjectId: "math", gameId: "shuk" });
  const [round, setRound] = useState(() => newChallenge());
  const { challenge, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.round) {
        setRound(s.round as ReturnType<typeof newChallenge>);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      progress.setRound((r) => r + 1);
      const newR = newChallenge();
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        round: progress.round + 1,
        state: { round: newR, answered: false, feedback: null },
      });
    }
  );

  const correct = challenge.change;

  const nextChallenge = useCallback(() => {
    const newR = newChallenge();
    setRound(newR);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { round: newR, answered: false, feedback: null },
    });
  }, [progress]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.shukCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { round, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.shukWrong", {
          change: correct,
          total: challenge.total,
          paid: challenge.paid,
        }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { round, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell title={gameTitle("math", "shuk")} emoji="🛒">
        <GameStatus
          current={sessionQuestion(progress.round)}
          total={SESSION_SIZE}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-amber-100 mb-3">
          <p className="text-base font-semibold text-amber-700 mb-3">{t("games.shoppingList")}</p>
          <div className="space-y-2">
            {challenge.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="font-medium">{getShukItemName(item, locale)}</span>
                <span className="font-bold text-amber-700">₪{item.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-amber-200 mt-3 pt-3 flex justify-between text-base">
            <span className="font-semibold">{t("games.youPay")}</span>
            <span className="font-bold text-green-700">₪{challenge.paid}</span>
          </div>
        </div>

        <p className="text-center text-xl font-bold text-gray-700 mb-4">
          {t("games.howMuchChange")}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-xl py-4 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
            >
              ₪{opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextChallenge} className="game-btn game-btn-primary w-full">
            {t("games.nextShopping")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
