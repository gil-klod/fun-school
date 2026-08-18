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
import { generateMystery, buildOptions } from "@/lib/data/math";

function newRound() {
  const q = generateMystery();
  return { question: q, options: buildOptions(q.answer) };
}

export default function MysteryPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "math", gameId: "mystery" });
  const [round, setRound] = useState(() => newRound());
  const { question, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.round) {
        setRound(s.round as ReturnType<typeof newRound>);
        setAnswered(!!s.answered);
        setShowHint(!!s.showHint);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      progress.setRound((r) => r + 1);
      const newR = newRound();
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      setShowHint(false);
      progress.save({
        round: progress.round + 1,
        state: { round: newR, answered: false, feedback: null, showHint: false },
      });
    }
  );

  const correct = question.answer;

  const nextQuestion = useCallback(() => {
    const newR = newRound();
    setRound(newR);
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { round: newR, answered: false, feedback: null, showHint: false },
    });
  }, [progress]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.mysteryCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { round, answered: true, feedback: fb, showHint },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.mysteryWrong", { answer: correct }),
        explanation: question.hint,
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { round, answered: true, feedback: fb, showHint },
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
      <BackButton href="/math" />

      <GameShell title={gameTitle("math", "mystery")} emoji="🔍">
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}

        <GameProgressBar
          score={progress.score}
          streak={progress.streak}
          round={progress.round}
          correct={progress.correct}
          wrong={progress.wrong}
        />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-purple-100 mb-6">
          <p className="text-xl font-medium text-gray-800 mb-3">{question.text}</p>
          <p className="text-lg text-gray-600" dir="rtl">
            {question.textHe}
          </p>
        </div>

        {!showHint && !answered && (
          <button
            onClick={() => {
              setShowHint(true);
              progress.save({ state: { round, answered, feedback, showHint: true } });
            }}
            className="text-indigo-500 font-semibold mb-4 hover:text-indigo-700 transition-colors"
          >
            {t("games.needHint")}
          </button>
        )}
        {showHint && !answered && (
          <div className="mb-4">
            <Feedback type="info" message={question.hint} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-2xl py-5 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
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
            {t("games.nextMystery")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
