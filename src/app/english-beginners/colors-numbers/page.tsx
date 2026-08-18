"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";
import { shuffleArray } from "@/lib/content/generators";

interface ColorNumberItem {
  type: "color" | "number";
  prompt: string;
  promptHe: string;
  answer: string;
  options: string[];
  emoji: string;
}

export default function ColorsNumbersPage() {
  const { t, gameTitle, locale } = useLocale();
  const { difficulty, changeDifficulty, progress, content, contentLoading, contentError, ready } =
    useGameSession("english-beginners", "colors-numbers");

  const items = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "color-number")
        .map((item) => item.data as unknown as ColorNumberItem),
    [content]
  );

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    setIndex(0);
    setOptions(shuffleArray([...items[0].options]));
    setFeedback(null);
    setAnswered(false);
  }, [difficulty, items]);

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
      if (items.length === 0) return;
      const nextIndex = (progress.gameState.index as number) + 1;
      const nextItem = items[nextIndex % items.length];
      const nextOptions = shuffleArray([...nextItem.options]);
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

  const item = items.length > 0 ? items[index % items.length] : null;

  const nextQuestion = useCallback(() => {
    if (items.length === 0 || !item) return;
    const nextIndex = index + 1;
    const nextItem = items[nextIndex % items.length];
    const nextOptions = shuffleArray([...nextItem.options]);
    setIndex(nextIndex);
    setOptions(nextOptions);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, options: nextOptions, answered: false, feedback: null },
    });
  }, [index, items, item, progress]);

  const handleAnswer = (answer: string) => {
    if (answered || !item) return;
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

  if (!ready || items.length === 0 || !item) {
    return (
      <GameContentGate
        loading={!ready || contentLoading || items.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  const prompt = locale === "he" ? item.promptHe : item.prompt;

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title={gameTitle("english-beginners", "colors-numbers")} emoji="🌈">
        <DifficultySelector value={difficulty} onChange={changeDifficulty} disabled={answered} />

        <GameStatus
          current={index + 1}
          total={items.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-3xl p-5 shadow-lg border-2 border-green-100 mb-4 text-center">
          <span className="text-6xl">{item.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{prompt}</p>
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
