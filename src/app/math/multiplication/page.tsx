"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { SESSION_SIZE, sessionQuestion } from "@/lib/session";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  generateMultiplication,
  TABLES,
  buildOptions,
} from "@/lib/data/math";

function newRound(table?: number) {
  const q = generateMultiplication(table);
  return { question: q, options: buildOptions(q.a * q.b) };
}

export default function MultiplicationPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "math", gameId: "multiplication" });
  const [table, setTable] = useState<number | undefined>(undefined);
  const [round, setRound] = useState(() => newRound());
  const { question, options } = round;
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
      if (s.round) {
        setTable(s.table as number | undefined);
        setRound(s.round as ReturnType<typeof newRound>);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const savedTable = progress.gameState.table as number | undefined;
      setTable(savedTable);
      progress.setRound((r) => r + 1);
      const newR = newRound(savedTable);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        round: progress.round + 1,
        state: { table: savedTable, round: newR, answered: false, feedback: null },
      });
    }
  );

  const correct = question.a * question.b;

  const nextQuestion = useCallback(
    (selectedTable?: number) => {
      const newR = newRound(selectedTable ?? table);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { table: selectedTable ?? table, round: newR, answered: false, feedback: null },
      });
    },
    [table, progress]
  );

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.multiplicationCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { table, round, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.multiplicationWrong", { answer: correct }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { table, round, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell title={gameTitle("math", "multiplication")} emoji="⚔️">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-2 scrollbar-none">
          <button
            onClick={() => { setTable(undefined); nextQuestion(undefined); }}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${!table ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
          >
            {t("games.mixed")}
          </button>
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => { setTable(t); nextQuestion(t); }}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${table === t ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
            >
              ×{t}
            </button>
          ))}
        </div>

        <GameStatus
          current={sessionQuestion(progress.round)}
          total={SESSION_SIZE}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-indigo-100 text-center mb-3">
          <p className="text-4xl font-extrabold text-indigo-700">
            {question.a} × {question.b} = ?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-xl py-4 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={() => nextQuestion()} className="game-btn game-btn-primary w-full">
            {t("common.nextQuestion")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
