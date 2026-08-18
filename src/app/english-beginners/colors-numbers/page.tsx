"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { COLORS_NUMBERS, shuffleArray } from "@/lib/data/english-beginners";

export default function ColorsNumbersPage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const item = COLORS_NUMBERS[index % COLORS_NUMBERS.length];
  const options = shuffleArray([...item.options]);

  const nextQuestion = useCallback(() => {
    setIndex((i) => i + 1);
    setFeedback(null);
    setAnswered(false);
  }, []);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === item.answer) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Yes! 🌈" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The answer was: ${item.answer}`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title="Colors & Numbers" titleHe="צבעים ומספרים" emoji="🌈">
        <ScoreBoard score={score} streak={streak} total={index + 1} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-green-100 mb-6 text-center">
          <span className="text-6xl">{item.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{item.prompt}</p>
          <p className="text-lg text-gray-500" dir="rtl">
            {item.promptHe}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
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
            Next →
          </button>
        )}
      </GameShell>
    </main>
  );
}
