"use client";

import { useState, useCallback } from "react";
import { useRestoreGameState } from "@/hooks/useRestoreGameState";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { HEBREW_WORDS, scrambleWord } from "@/lib/data/hebrew";

function pickWord() {
  return HEBREW_WORDS[Math.floor(Math.random() * HEBREW_WORDS.length)];
}

function newWordData() {
  const w = pickWord();
  return { ...w, scrambled: scrambleWord(w.word) };
}

export default function ScramblePage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "hebrew", gameId: "scramble" });
  const [wordData, setWordData] = useState(() => newWordData());
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  useRestoreGameState(progress.loaded, progress.resumed, progress.gameState, (s) => {
    if (s.wordData) {
      setWordData(s.wordData as ReturnType<typeof newWordData>);
      setGuess((s.guess as string) ?? "");
      setAnswered(!!s.answered);
      if (s.feedback) setFeedback(s.feedback as typeof feedback);
    }
  });

  const nextWord = useCallback(() => {
    const w = newWordData();
    setWordData(w);
    setGuess("");
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { wordData: w, guess: "", answered: false, feedback: null },
    });
  }, [progress]);

  const checkAnswer = () => {
    if (answered || !guess.trim()) return;
    setAnswered(true);

    if (guess.trim() === wordData.word) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.scrambleCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { wordData, guess, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.scrambleWrong", { word: wordData.word }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { wordData, guess, answered: true, feedback: fb },
      });
    }
  };

  if (!progress.loaded) {
    return (
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title={gameTitle("hebrew", "scramble")} emoji="🔤" contentDir="rtl">
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}

        <ScoreBoard score={progress.score} streak={progress.streak} total={progress.round} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-blue-100 mb-6 text-center">
          <p className="text-sm text-blue-500 font-medium mb-2">{t("games.unscramble")}</p>
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
          placeholder={t("games.writeWord")}
          dir="rtl"
          className="w-full text-2xl text-center px-6 py-4 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none mb-4 disabled:opacity-50"
        />

        {!answered && (
          <button onClick={checkAnswer} className="game-btn game-btn-primary w-full mb-4">
            {t("common.check")}
          </button>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextWord} className="game-btn game-btn-primary w-full">
            {t("games.nextWord")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
