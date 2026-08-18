"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import type { QuizQuestion } from "@/lib/types";

interface QuizGameProps {
  backHref: string;
  title: string;
  titleHe: string;
  emoji: string;
  questions: QuizQuestion[];
}

export function QuizGame({ backHref, title, titleHe, emoji, questions }: QuizGameProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = questions[index % questions.length];

  const nextQuestion = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setAnswered(false);
  }, [index, questions.length]);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Correct! 🌟" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `Answer: ${question.options[question.correctIndex]}`,
        explanation: question.explanation,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href={backHref} />

      <GameShell title={title} titleHe={titleHe} emoji={emoji}>
        <ScoreBoard score={score} streak={streak} total={index + 1} />

        {!finished ? (
          <>
            <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-pink-100 mb-6">
              <p className="text-xl font-bold text-gray-800">{question.question}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`game-btn-option text-lg py-4 text-left ${answered && i === question.correctIndex ? "correct" : ""} ${answered && i !== question.correctIndex ? "opacity-50" : ""}`}
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
                {index + 1 >= questions.length ? "See Results →" : "Next Question →"}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Feedback
              type="correct"
              message={`All done! Final score: ${score} 🏆`}
            />
            <button
              onClick={() => {
                setIndex(0);
                setScore(0);
                setStreak(0);
                setFinished(false);
                setFeedback(null);
                setAnswered(false);
              }}
              className="game-btn game-btn-primary w-full mt-4"
            >
              Play Again
            </button>
          </div>
        )}
      </GameShell>
    </main>
  );
}
