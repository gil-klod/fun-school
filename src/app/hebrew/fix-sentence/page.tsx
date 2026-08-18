"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { FIX_SENTENCES } from "@/lib/data/hebrew";

export default function FixSentencePage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = FIX_SENTENCES[index % FIX_SENTENCES.length];

  const nextQuestion = useCallback(() => {
    setIndex((i) => i + 1);
    setFeedback(null);
    setAnswered(false);
  }, []);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);

    if (option === question.mistake) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({
        type: "correct",
        message: "נכון! Correct!",
        explanation: question.explanation,
      });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The mistake was: "${question.mistake}"`,
        explanation: question.explanation,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title="Fix the Sentence" titleHe="תקן את המשפט" emoji="✏️" dir="rtl">
        <ScoreBoard score={score} streak={streak} total={index + 1} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-blue-100 mb-4 text-center">
          <p className="text-sm text-blue-500 font-medium mb-3">Find the mistake:</p>
          <p className="text-2xl font-bold text-gray-800 leading-relaxed">{question.wrong}</p>
        </div>

        <p className="text-center text-lg font-semibold text-gray-600 mb-4">
          Which word is wrong?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-xl py-4 ${answered && opt === question.mistake ? "correct" : ""} ${answered && opt !== question.mistake ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className="bg-green-50 rounded-2xl p-4 mb-4 border-2 border-green-200" dir="rtl">
            <p className="text-sm text-green-600 font-medium">Correct sentence:</p>
            <p className="text-xl font-bold text-green-800">{question.correct}</p>
          </div>
        )}

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
            Next Sentence →
          </button>
        )}
      </GameShell>
    </main>
  );
}
