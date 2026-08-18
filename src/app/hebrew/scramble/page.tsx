"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { HEBREW_WORDS, scrambleWord } from "@/lib/data/hebrew";

function pickWord() {
  return HEBREW_WORDS[Math.floor(Math.random() * HEBREW_WORDS.length)];
}

export default function ScramblePage() {
  const [wordData, setWordData] = useState(() => {
    const w = pickWord();
    return { ...w, scrambled: scrambleWord(w.word) };
  });
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const nextWord = useCallback(() => {
    const w = pickWord();
    setWordData({ ...w, scrambled: scrambleWord(w.word) });
    setGuess("");
    setFeedback(null);
    setAnswered(false);
    setRound((r) => r + 1);
  }, []);

  const checkAnswer = () => {
    if (answered || !guess.trim()) return;
    setAnswered(true);

    if (guess.trim() === wordData.word) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "מצוין! Excellent!" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The word was: ${wordData.word}`,
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title="Word Scramble" titleHe="ערבוב אותיות" emoji="🔤" dir="rtl">
        <ScoreBoard score={score} streak={streak} total={round} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-blue-100 mb-6 text-center">
          <p className="text-sm text-blue-500 font-medium mb-2">Unscramble this word:</p>
          <p className="text-5xl font-extrabold text-blue-700 tracking-widest mb-4">
            {wordData.scrambled.split("").join(" ")}
          </p>
          <p className="text-gray-500">Hint: {wordData.hint}</p>
          <p className="text-sm text-gray-400 mt-1">Category: {wordData.category}</p>
        </div>

        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
          disabled={answered}
          placeholder="כתוב את המילה..."
          dir="rtl"
          className="w-full text-2xl text-center px-6 py-4 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none mb-4 disabled:opacity-50"
        />

        {!answered && (
          <button onClick={checkAnswer} className="game-btn game-btn-primary w-full mb-4">
            Check ✓
          </button>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextWord} className="game-btn game-btn-primary w-full">
            Next Word →
          </button>
        )}
      </GameShell>
    </main>
  );
}
