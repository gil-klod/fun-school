"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";

interface FixSentenceQuestion {
  wrong: string;
  correct: string;
  mistake: string;
  options: string[];
  explanationHe: string;
  explanationEn: string;
}

function getFixSentenceExplanation(question: FixSentenceQuestion, locale: "he" | "en") {
  return locale === "he" ? question.explanationHe : question.explanationEn;
}

function FixSentencePlay({
  sentences,
  difficulty,
  changeDifficulty,
  progress,
}: {
  sentences: FixSentenceQuestion[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle, locale } = useLocale();
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFeedback(null);
    setAnswered(false);
  }, [difficulty, sentences.length]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.index !== undefined) {
        setIndex(s.index as number);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const nextIndex = (progress.gameState.index as number) + 1;
      setIndex(nextIndex);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { index: nextIndex, answered: false, feedback: null },
      });
    }
  );

  const question = sentences[index % sentences.length];

  const nextQuestion = useCallback(() => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, answered: false, feedback: null },
    });
  }, [index, progress]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);

    if (option === question.mistake) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = {
        type: "correct" as const,
        message: t("games.fixCorrect"),
      };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.fixWrong", { mistake: question.mistake }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title={gameTitle("hebrew", "fix-sentence")} emoji="✏️" contentDir="rtl">
        <DifficultySelector
          value={difficulty}
          onChange={changeDifficulty}
          disabled={answered}
        />

        <GameStatus
          current={index + 1}
          total={sentences.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-3xl p-5 shadow-lg border-2 border-blue-100 mb-4 text-center">
          <p className="text-sm text-blue-500 font-medium mb-3">{t("games.findMistake")}</p>
          <p className="text-2xl font-bold text-gray-800 leading-relaxed">{question.wrong}</p>
        </div>

        <p className="text-center text-lg font-semibold text-gray-600 mb-4">
          {t("games.whichWordWrong")}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
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
            <p className="text-sm text-green-600 font-medium">{t("games.correctSentence")}</p>
            <p className="text-xl font-bold text-green-800">{question.correct}</p>
          </div>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback
              type={feedback.type}
              message={feedback.message}
              explanation={getFixSentenceExplanation(question, locale)}
            />
          </div>
        )}

        {answered && (
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            {t("games.nextSentence")}
          </button>
        )}
      </GameShell>
    </main>
  );
}

export default function FixSentencePage() {
  const session = useGameSession("hebrew", "fix-sentence");
  const { ready, content, contentLoading, contentError, difficulty, changeDifficulty, progress } =
    session;

  const sentences = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "fix-sentence")
        .map((item) => item.data as unknown as FixSentenceQuestion),
    [content]
  );

  if (!ready || sentences.length === 0) {
    return (
      <GameContentGate
        loading={!ready || contentLoading || sentences.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <FixSentencePlay
      sentences={sentences}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
