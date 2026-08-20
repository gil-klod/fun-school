"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage, GameOptionsGrid } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";

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
  lockDifficulty,
}: {
  sentences: FixSentenceQuestion[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
  lockDifficulty?: boolean;
}) {
  const { t, gameTitle, locale } = useLocale();
  const project = useProjectGame();
  const [slotDone, setSlotDone] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
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
      const savedIndex = progress.gameState.index as number;
      const nextIndex = savedIndex + 1;
      if (nextIndex >= sentences.length) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
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
    const result = project.handleIndexNext(
      nextIndex,
      sentences.length,
      progress.markCompleted,
      () => {
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
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [index, progress, project, sentences.length]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    setIndex(0);
    setFeedback(null);
    setAnswered(false);
    progress.setScore(0);
    progress.setStreak(0);
    progress.setRound(1);
    progress.setCorrect(0);
    progress.setWrong(0);
    progress.save({
      score: 0,
      streak: 0,
      round: 1,
      correct: 0,
      wrong: 0,
      status: "in_progress",
      state: { index: 0, answered: false, feedback: null },
    });
  }, [progress]);

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
    <GamePage>
      <GameShell
        title={gameTitle("hebrew", "fix-sentence")}
        emoji="✏️"
        contentDir="rtl"
        difficulty={difficulty}
        onDifficultyChange={changeDifficulty}
        difficultyDisabled={answered || lockDifficulty}
      >
        <GameStatus
          current={index + 1}
          total={sentences.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        {!sessionComplete && !slotDone ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
              <div>
                <div className="bg-white/90 rounded-2xl p-5 shadow border-2 border-blue-100 text-center">
                  <p className="text-sm text-blue-500 font-medium mb-3">{t("games.findMistake")}</p>
                  <p className="text-2xl font-bold text-gray-800 leading-relaxed">{question.wrong}</p>
                </div>
                <p className="text-center text-lg font-semibold text-gray-600 mt-4">
                  {t("games.whichWordWrong")}
                </p>
              </div>

              <GameOptionsGrid>
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
              </GameOptionsGrid>
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
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {index + 1 >= sentences.length ? t("common.seeResults") : t("games.nextSentence")}
              </button>
            )}
          </>
        ) : slotDone ? (
          <ProjectSlotDone />
        ) : (
          <SessionComplete score={progress.score} onPlayAgain={playAgain} />
        )}
      </GameShell>
    </GamePage>
  );
}

export default function FixSentencePage() {
  const session = useGameSession("hebrew", "fix-sentence");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
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
        loading={!ready || sentences.length === 0}
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
      lockDifficulty={lockDifficulty}
    />
  );
}
