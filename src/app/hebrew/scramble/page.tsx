"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameProgressBar } from "@/components/GameProgressBar";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  newScrambleWord,
  getWordHint,
  getWordCategory,
  type HebrewWord,
} from "@/lib/data/hebrew";

type WordData = HebrewWord & { scrambled: string };

export default function ScramblePage() {
  const { t, gameTitle, locale } = useLocale();
  const progress = useGameProgress({ subjectId: "hebrew", gameId: "scramble" });
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [wordData, setWordData] = useState<WordData>(() => newScrambleWord());
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const w = newScrambleWord(currentUsed);
      setWordData(w);
      setGuess("");
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: { wordData: w, usedWords: currentUsed, guess: "", answered: false, feedback: null },
      });
    },
    [progress]
  );

  const nextWord = useCallback(() => {
    const used = usedWords.includes(wordData.word)
      ? usedWords
      : [...usedWords, wordData.word];
    setUsedWords(used);
    progress.setRound((r) => r + 1);
    progress.save({ round: progress.round + 1 });
    advanceToNext(used);
  }, [usedWords, wordData.word, progress, advanceToNext]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedWords as string[]) ?? [];
      setUsedWords(used);
      if (s.wordData) {
        setWordData(s.wordData as WordData);
        setGuess((s.guess as string) ?? "");
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const used = (progress.gameState.usedWords as string[]) ?? [];
      const lastWord = (progress.gameState.wordData as WordData | undefined)?.word;
      const updatedUsed =
        lastWord && !used.includes(lastWord) ? [...used, lastWord] : used;
      setUsedWords(updatedUsed);
      progress.setRound((r) => r + 1);
      advanceToNext(updatedUsed);
    }
  );

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
        state: { wordData, usedWords, guess, answered: true, feedback: fb },
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
        state: { wordData, usedWords, guess, answered: true, feedback: fb },
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

        <GameProgressBar
          score={progress.score}
          streak={progress.streak}
          round={progress.round}
          correct={progress.correct}
          wrong={progress.wrong}
        />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-blue-100 mb-6 text-center">
          <p className="text-sm text-blue-500 font-medium mb-2">{t("games.unscramble")}</p>
          <p className="text-5xl font-extrabold text-blue-700 tracking-widest mb-4">
            {wordData.scrambled.split("").join(" ")}
          </p>
          <p className="text-gray-500">
            {t("games.hint")}: {getWordHint(wordData, locale)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t("games.category")}: {getWordCategory(wordData, locale)}
          </p>
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
