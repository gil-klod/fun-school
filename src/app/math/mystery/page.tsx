"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { generateMystery, buildOptions } from "@/lib/data/math";

function newRound() {
  const q = generateMystery();
  return { question: q, options: buildOptions(q.answer) };
}

export default function MysteryPage() {
  const [round, setRound] = useState(() => newRound());
  const { question, options } = round;
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const correct = question.answer;

  const nextQuestion = useCallback(() => {
    setRound(newRound());
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
    setRoundNum((r) => r + 1);
  }, []);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "You found it! 🕵️" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The answer was ${correct}.`,
        explanation: question.hint,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell title="Mystery Number" titleHe="מספר מסתורי" emoji="🔍">
        <ScoreBoard score={score} streak={streak} total={roundNum} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-purple-100 mb-6">
          <p className="text-xl font-medium text-gray-800 mb-3">{question.text}</p>
          <p className="text-lg text-gray-600" dir="rtl">
            {question.textHe}
          </p>
        </div>

        {!showHint && !answered && (
          <button
            onClick={() => setShowHint(true)}
            className="text-indigo-500 font-semibold mb-4 hover:text-indigo-700 transition-colors"
          >
            💡 Need a hint?
          </button>
        )}
        {showHint && !answered && (
          <div className="mb-4">
            <Feedback type="info" message={question.hint} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-2xl py-5 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4">
            <Feedback
              type={feedback.type}
              message={feedback.message}
              explanation={feedback.explanation}
            />
          </div>
        )}

        {answered && (
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            Next Mystery →
          </button>
        )}
      </GameShell>
    </main>
  );
}
