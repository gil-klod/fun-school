"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { BEGINNER_VOCAB, shuffleArray } from "@/lib/data/english-beginners";

function generateQuestion() {
  const correct = BEGINNER_VOCAB[Math.floor(Math.random() * BEGINNER_VOCAB.length)];
  const others = shuffleArray(BEGINNER_VOCAB.filter((v) => v.english !== correct.english)).slice(0, 3);
  const options = shuffleArray([correct, ...others]);
  const askHebrew = Math.random() > 0.5;

  return {
    prompt: askHebrew
      ? `What is "${correct.hebrew}" in English?`
      : `What is "${correct.english}" in Hebrew?`,
    promptHe: askHebrew
      ? `מה זה "${correct.hebrew}" באנגלית?`
      : `מה זה "${correct.english}" בעברית?`,
    correct: askHebrew ? correct.english : correct.hebrew,
    options: askHebrew
      ? options.map((o) => o.english)
      : options.map((o) => o.hebrew),
    emoji: correct.emoji,
  };
}

export default function VocabularyPage() {
  const [question, setQuestion] = useState(() => generateQuestion());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
    setFeedback(null);
    setAnswered(false);
    setRound((r) => r + 1);
  }, []);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === question.correct) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Great job! 🎯" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The answer was: ${question.correct}`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title="Word Match" titleHe="התאמת מילים" emoji="🎯">
        <ScoreBoard score={score} streak={streak} total={round} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-green-100 mb-6 text-center">
          <span className="text-5xl">{question.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{question.prompt}</p>
          <p className="text-lg text-gray-500 mt-2" dir="rtl">
            {question.promptHe}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-lg py-4 ${answered && opt === question.correct ? "correct" : ""} ${answered && opt !== question.correct ? "opacity-50" : ""}`}
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
            Next Word →
          </button>
        )}
      </GameShell>
    </main>
  );
}
