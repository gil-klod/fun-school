"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { SENTENCE_CHALLENGES, shuffleArray } from "@/lib/data/english-beginners";

export default function SentencesPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const challenge = SENTENCE_CHALLENGES[index % SENTENCE_CHALLENGES.length];

  const unusedWords = (() => {
    const counts: Record<string, number> = {};
    challenge.words.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
    selected.forEach((w) => { counts[w] = (counts[w] || 0) - 1; });
    const result: string[] = [];
    Object.entries(counts).forEach(([word, count]) => {
      for (let i = 0; i < count; i++) result.push(word);
    });
    return shuffleArray(result);
  })();

  const nextChallenge = useCallback(() => {
    setIndex((i) => i + 1);
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
  }, []);

  const addWord = (word: string) => {
    if (answered) return;
    setSelected((s) => [...s, word]);
  };

  const removeWord = (idx: number) => {
    if (answered) return;
    setSelected((s) => s.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    if (answered || selected.length !== challenge.words.length) return;
    setAnswered(true);
    const answer = selected.join(" ");

    if (answer === challenge.correct) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "Perfect sentence! 🧩" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `Correct: "${challenge.correct}" (${challenge.translation})`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title="Build a Sentence" titleHe="בנה משפט" emoji="🧩">
        <ScoreBoard score={score} streak={streak} total={index + 1} />

        <p className="text-center text-gray-600 mb-4" dir="rtl">
          {challenge.translation}
        </p>

        <div
          className="bg-white/90 rounded-2xl p-4 min-h-[60px] shadow-inner border-2 border-green-200 mb-4 flex flex-wrap gap-2 items-center justify-center"
          onClick={() => {
            if (selected.length > 0 && !answered) removeWord(selected.length - 1);
          }}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400">Tap words below...</span>
          ) : (
            selected.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-semibold cursor-pointer hover:bg-green-200"
                onClick={(e) => { e.stopPropagation(); removeWord(i); }}
              >
                {word}
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {unusedWords.map((word, i) => (
            <button
              key={`${word}-${i}`}
              onClick={() => addWord(word)}
              disabled={answered}
              className="game-btn-option py-3 px-5"
            >
              {word}
            </button>
          ))}
        </div>

        {!answered && (
          <button
            onClick={checkAnswer}
            disabled={selected.length !== challenge.words.length}
            className="game-btn game-btn-primary w-full mb-4 disabled:opacity-40"
          >
            Check Sentence ✓
          </button>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextChallenge} className="game-btn game-btn-primary w-full">
            Next Sentence →
          </button>
        )}
      </GameShell>
    </main>
  );
}
