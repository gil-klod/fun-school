"use client";

import { useState, useCallback } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import type { QuizQuestion } from "@/lib/types";

interface QuizGameProps {
  subjectId: string;
  gameId: string;
  backHref: string;
  emoji: string;
  questions: QuizQuestion[];
}

export function QuizGame({
  subjectId,
  gameId,
  backHref,
  emoji,
  questions,
}: QuizGameProps) {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId, gameId });
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
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({ round: progress.round + 1, state: { index: index + 1 } });
  }, [index, questions.length, progress]);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index },
      });
      setFeedback({ type: "correct", message: t("games.correct") });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      progress.save({ streak: 0, wrong: progress.wrong + 1, state: { index } });
      setFeedback({
        type: "wrong",
        message: t("games.wrongAnswer", { answer: question.options[question.correctIndex] }),
        explanation: question.explanation,
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
      <BackButton href={backHref} />

      <GameShell title={gameTitle(subjectId, gameId)} emoji={emoji}>
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}
        <ScoreBoard score={progress.score} streak={progress.streak} total={index + 1} />

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
                {index + 1 >= questions.length ? t("common.seeResults") : t("common.nextQuestion")}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Feedback
              type="correct"
              message={t("games.allDone", { score: progress.score })}
            />
            <button
              onClick={() => {
                setIndex(0);
                progress.setScore(0);
                progress.setStreak(0);
                progress.setRound(1);
                setFinished(false);
                setFeedback(null);
                setAnswered(false);
                progress.save({ score: 0, streak: 0, round: 1, status: "in_progress", state: { index: 0 } });
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
