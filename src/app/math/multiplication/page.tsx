"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import {
  generateMultiplication,
  TABLES,
  buildOptions,
} from "@/lib/data/math";

function newRound(table?: number) {
  const q = generateMultiplication(table);
  return { question: q, options: buildOptions(q.a * q.b) };
}

export default function MultiplicationPage() {
  const [table, setTable] = useState<number | undefined>(undefined);
  const [round, setRound] = useState(() => newRound());
  const { question, options } = round;
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const correct = question.a * question.b;

  const nextQuestion = useCallback((selectedTable?: number) => {
    setRound(newRound(selectedTable ?? table));
    setFeedback(null);
    setAnswered(false);
    setRoundNum((r) => r + 1);
  }, [table]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Awesome! Keep going!" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The answer is ${correct}. Try the next one!`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell
        title="Multiplication Boss"
        titleHe="בוס הכפל"
        emoji="⚔️"
      >
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            onClick={() => { setTable(undefined); nextQuestion(undefined); }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${!table ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
          >
            Mixed
          </button>
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => { setTable(t); nextQuestion(t); }}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${table === t ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
            >
              ×{t}
            </button>
          ))}
        </div>

        <ScoreBoard score={score} streak={streak} total={roundNum} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-indigo-100 text-center mb-6">
          <p className="text-5xl font-extrabold text-indigo-700">
            {question.a} × {question.b} = ?
          </p>
        </div>

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
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            Next Question →
          </button>
        )}
      </GameShell>
    </main>
  );
}
