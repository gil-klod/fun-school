"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { COLORS_NUMBERS, shuffleArray } from "@/lib/data/english-beginners";

export default function ColorsNumbersPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "english-beginners", gameId: "colors-numbers" });
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>(() =>
    shuffleArray([...COLORS_NUMBERS[0].options])
  );
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
      if (s.index !== undefined) {
        setIndex(s.index as number);
        if (s.options) setOptions(s.options as string[]);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const nextIndex = (progress.gameState.index as number) + 1;
      const nextOptions = shuffleArray([...COLORS_NUMBERS[nextIndex % COLORS_NUMBERS.length].options]);
      setIndex(nextIndex);
      setOptions(nextOptions);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { index: nextIndex, options: nextOptions, answered: false, feedback: null },
      });
    }
  );

  const item = COLORS_NUMBERS[index % COLORS_NUMBERS.length];

  const nextQuestion = useCallback(() => {
    const nextIndex = index + 1;
    const nextOptions = shuffleArray([...COLORS_NUMBERS[nextIndex % COLORS_NUMBERS.length].options]);
    setIndex(nextIndex);
    setOptions(nextOptions);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, options: nextOptions, answered: false, feedback: null },
    });
  }, [index, progress]);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === item.answer) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.colorsCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, options, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.colorsWrong", { answer: item.answer }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, options, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title={gameTitle("english-beginners", "colors-numbers")} emoji="🌈">
        <GameStatus
          current={index + 1}
          total={COLORS_NUMBERS.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-3xl p-5 shadow-lg border-2 border-green-100 mb-4 text-center">
          <span className="text-6xl">{item.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{item.prompt}</p>
          <p className="text-lg text-gray-500" dir="rtl">
            {item.promptHe}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-lg py-4 ${answered && opt === item.answer ? "correct" : ""} ${answered && opt !== item.answer ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            {t("common.continue")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
