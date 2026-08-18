"use client";

import { useState, useCallback, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";
import type { QuizQuestion } from "@/lib/types";

interface QuizGameProps {
  subjectId: string;
  gameId: string;
  backHref: string;
  emoji: string;
  contentDir?: "ltr" | "rtl";
}

function QuizGamePlay({
  subjectId,
  gameId,
  backHref,
  emoji,
  contentDir,
  questions,
  difficulty,
  changeDifficulty,
  progress,
}: QuizGameProps & {
  questions: QuizQuestion[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle } = useLocale();

  const [index, setIndex] = useState(0);
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
      progress.markCompleted();
      progress.save({
        state: { index, finished: true, answered: false, feedback: null },
        status: "completed",
      });
      return;
    }
    const nextIdx = index + 1;
    setIndex(nextIdx);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIdx, answered: false, feedback: null, finished: false },
    });
  }, [index, questions.length, progress]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.index !== undefined) setIndex(s.index as number);
      setFinished(!!s.finished);
      setAnswered(!!s.answered);
      if (s.feedback) setFeedback(s.feedback as typeof feedback);
    },
    () => {
      const idx = progress.gameState.index as number;
      if (idx + 1 >= questions.length) {
        setFinished(true);
        progress.markCompleted();
        progress.save({
          state: { index: idx, finished: true, answered: false, feedback: null },
          status: "completed",
        });
      } else {
        const nextIdx = idx + 1;
        setIndex(nextIdx);
        setFeedback(null);
        setAnswered(false);
        setFinished(false);
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { index: nextIdx, answered: false, feedback: null, finished: false },
        });
      }
    }
  );

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.correct") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, answered: true, feedback: fb, finished: false },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.wrongAnswer", { answer: question.options[question.correctIndex] }),
        explanation: question.explanation,
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, answered: true, feedback: fb, finished: false },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href={backHref} />

      <GameShell title={gameTitle(subjectId, gameId)} emoji={emoji} contentDir={contentDir}>
        <DifficultySelector
          value={difficulty}
          onChange={changeDifficulty}
          disabled={answered && !finished}
        />

        <GameStatus
          current={index + 1}
          total={questions.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        {!finished ? (
          <>
            <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-pink-100 mb-3">
              <p className="text-lg font-bold text-gray-800">{question.question}</p>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-3">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`game-btn-option text-base py-3 text-left ${answered && i === question.correctIndex ? "correct" : ""} ${answered && i !== question.correctIndex ? "opacity-50" : ""}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && (
              <div className="mb-3">
                <Feedback
                  type={feedback.type}
                  message={feedback.message}
                  explanation={feedback.explanation}
                />
              </div>
            )}

            {answered && (
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
                {index + 1 >= questions.length ? t("common.seeResults") : t("common.nextQuestion")}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Feedback type="correct" message={t("games.allDone", { score: progress.score })} />
            <button
              onClick={() => {
                setIndex(0);
                progress.setScore(0);
                progress.setStreak(0);
                progress.setRound(1);
                progress.setCorrect(0);
                progress.setWrong(0);
                setFinished(false);
                setFeedback(null);
                setAnswered(false);
                progress.save({
                  score: 0,
                  streak: 0,
                  round: 1,
                  correct: 0,
                  wrong: 0,
                  status: "in_progress",
                  state: { index: 0, answered: false, feedback: null, finished: false },
                });
              }}
              className="game-btn game-btn-primary w-full mt-4"
            >
              {t("common.playAgain")}
            </button>
          </div>
        )}
      </GameShell>
    </main>
  );
}

export function QuizGame(props: QuizGameProps) {
  const { subjectId, gameId } = props;
  const session = useGameSession(subjectId, gameId);
  const { content, contentError, ready, difficulty, changeDifficulty, progress } =
    session;

  const questions = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "quiz")
        .map((item) => item.data as unknown as QuizQuestion),
    [content]
  );

  if (!ready || questions.length === 0) {
    return (
      <GameContentGate
        loading={!ready || questions.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <QuizGamePlay
      key={difficulty}
      {...props}
      questions={questions}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
