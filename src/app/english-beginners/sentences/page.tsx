"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { SENTENCE_CHALLENGES, shuffleArray } from "@/lib/data/english-beginners";

export default function SentencesPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "english-beginners", gameId: "sentences" });
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.index !== undefined) {
        setIndex(s.index as number);
        setSelected((s.selected as string[]) ?? []);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const nextIndex = (progress.gameState.index as number) + 1;
      setIndex(nextIndex);
      setSelected([]);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { index: nextIndex, selected: [], answered: false, feedback: null },
      });
    }
  );

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
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, selected: [], answered: false, feedback: null },
    });
  }, [index, progress]);

  const addWord = (word: string) => {
    if (answered) return;
    const next = [...selected, word];
    setSelected(next);
    progress.save({ state: { index, selected: next, answered, feedback } });
  };

  const removeWord = (idx: number) => {
    if (answered) return;
    const next = selected.filter((_, i) => i !== idx);
    setSelected(next);
    progress.save({ state: { index, selected: next, answered, feedback } });
  };

  const checkAnswer = () => {
    if (answered || selected.length !== challenge.words.length) return;
    setAnswered(true);
    const answer = selected.join(" ");

    if (answer === challenge.correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.sentenceCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, selected, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.sentenceWrong", {
          answer: challenge.correct,
          translation: challenge.translation,
        }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, selected, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title={gameTitle("english-beginners", "sentences")} emoji="🧩">
        <GameStatus
          current={index + 1}
          total={SENTENCE_CHALLENGES.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

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
            <span className="text-gray-400">{t("games.tapWords")}</span>
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

        <div className="flex flex-wrap gap-2 justify-center mb-4">
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
            {t("games.checkSentence")}
          </button>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextChallenge} className="game-btn game-btn-primary w-full">
            {t("games.nextSentence")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
