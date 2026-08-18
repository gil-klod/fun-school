"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { generateShukChallenge, buildOptions } from "@/lib/data/math";

function newChallenge() {
  const c = generateShukChallenge();
  return { challenge: c, options: buildOptions(c.change) };
}

export default function ShukPage() {
  const [round, setRound] = useState(() => newChallenge());
  const { challenge, options } = round;
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const correct = challenge.change;

  const nextChallenge = useCallback(() => {
    setRound(newChallenge());
    setFeedback(null);
    setAnswered(false);
    setRoundNum((r) => r + 1);
  }, []);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Perfect change! 🛒" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `Change is ₪${correct}. Total was ₪${challenge.total}, paid ₪${challenge.paid}.`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell title="Shuk Challenge" titleHe="אתגר השוק" emoji="🛒">
        <ScoreBoard score={score} streak={streak} total={roundNum} />

        <div className="bg-white/90 rounded-3xl p-6 shadow-lg border-2 border-amber-100 mb-6">
          <p className="text-lg font-semibold text-amber-700 mb-4">Your shopping list:</p>
          <div className="space-y-3">
            {challenge.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-medium">
                  {item.name}{" "}
                  <span className="text-gray-500" dir="rtl">
                    ({item.nameHe})
                  </span>
                </span>
                <span className="font-bold text-amber-700">₪{item.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-amber-200 mt-4 pt-4 flex justify-between text-lg">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-amber-800">₪{challenge.total}</span>
          </div>
          <div className="flex justify-between text-lg mt-2">
            <span className="font-semibold">You pay:</span>
            <span className="font-bold text-green-700">₪{challenge.paid}</span>
          </div>
        </div>

        <p className="text-center text-xl font-bold text-gray-700 mb-4">
          How much change do you get? 💰
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
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
            Next Shopping Trip →
          </button>
        )}
      </GameShell>
    </main>
  );
}
