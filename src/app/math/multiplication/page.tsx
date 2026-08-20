"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { GameShell, GamePage, GameOptionsGrid } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { MathLtr } from "@/components/MathLtr";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";
import { generateMultiplication, buildOptions } from "@/lib/content/generators";
import type { MultiplicationConfig } from "@/lib/content/types";

function newRound(config: MultiplicationConfig, table?: number) {
  const q = generateMultiplication(config, table);
  return { question: q, options: buildOptions(q.a * q.b) };
}

function MultiplicationPlay({
  config,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  config: MultiplicationConfig;
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
  lockDifficulty?: boolean;
}) {
  const { t, gameTitle } = useLocale();
  const project = useProjectGame();
  const [slotDone, setSlotDone] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const tables = config.tables.length > 0 ? config.tables : [2, 3, 4, 5];
  const [table, setTable] = useState<number | undefined>(undefined);
  const [round, setRound] = useState(() => newRound(config));
  const { question, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setTable(undefined);
    setRound(newRound(config));
    setFeedback(null);
    setAnswered(false);
    resetQuestionNum();
  }, [difficulty, config, resetQuestionNum]);

  const saveState = useCallback(
    (patch: Record<string, unknown>) => {
      progress.save({
        state: {
          table,
          round,
          answered,
          feedback,
          questionNum,
          ...patch,
        },
      });
    },
    [progress, table, round, answered, feedback, questionNum]
  );

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
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const savedTable = progress.gameState.table as number | undefined;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setTable(savedTable);
      advanceQuestionNum();
      const newR = newRound(config, savedTable);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: {
          table: savedTable,
          round: newR,
          answered: false,
          feedback: null,
          questionNum: savedNum + 1,
        },
      });
    }
  );

  const correct = question.a * question.b;

  /** Change times table — new question only, does NOT advance progress. */
  const switchTable = useCallback(
    (selectedTable?: number) => {
      setTable(selectedTable);
      const newR = newRound(config, selectedTable);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      saveState({ table: selectedTable, round: newR, answered: false, feedback: null });
    },
    [config, saveState]
  );

  /** After answering — advance to next question in the session. */
  const goToNextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        advanceQuestionNum();
        const newR = newRound(config, table);
        setRound(newR);
        setFeedback(null);
        setAnswered(false);
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: {
            table,
            round: newR,
            answered: false,
            feedback: null,
            questionNum: nextNum,
          },
        });
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [project, questionNum, sessionSize, advanceQuestionNum, config, table, progress]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setTable(undefined);
    const newR = newRound(config);
    setRound(newR);
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
      state: { table: undefined, round: newR, answered: false, feedback: null, questionNum: 1 },
    });
  }, [progress, config, resetQuestionNum]);

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
        state: { table, round, answered: true, feedback: fb, questionNum },
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
        state: { table, round, answered: true, feedback: fb, questionNum },
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("math", "multiplication")}
        emoji="⚔️"
        difficulty={difficulty}
        onDifficultyChange={changeDifficulty}
        difficultyDisabled={answered || lockDifficulty}
        toolbar={
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => switchTable(undefined)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${!table ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
            >
              {t("games.mixed")}
            </button>
            {tables.map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => switchTable(tbl)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${table === tbl ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-200"}`}
              >
                <MathLtr>×{tbl}</MathLtr>
              </button>
            ))}
          </div>
        }
      >
        <GameStatus
          current={questionNum}
          total={sessionSize}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        {!sessionComplete && !slotDone ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
              <div className="bg-white/90 rounded-2xl p-6 sm:p-8 shadow border-2 border-indigo-100 flex items-center justify-center min-h-[8rem]">
                <MathLtr className="text-4xl sm:text-5xl font-extrabold text-indigo-700">
                  {question.a} × {question.b} = ?
                </MathLtr>
              </div>

              <GameOptionsGrid>
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                    className={`game-btn-option text-xl py-4 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
                  >
                    <MathLtr>{opt}</MathLtr>
                  </button>
                ))}
              </GameOptionsGrid>
            </div>

            {feedback && (
              <div className="mb-4">
                <Feedback type={feedback.type} message={feedback.message} />
              </div>
            )}

            {answered && (
              <button type="button" onClick={goToNextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {questionNum >= sessionSize ? t("common.seeResults") : t("common.nextQuestion")}
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

export default function MultiplicationPage() {
  const session = useGameSession("math", "multiplication");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
    session;

  const config = useMemo(
    () => (content?.config ?? null) as MultiplicationConfig | null,
    [content]
  );

  if (!ready || !config) {
    return (
      <GameContentGate loading={!ready || !config} error={contentError}>
        {null}
      </GameContentGate>
    );
  }

  return (
    <MultiplicationPlay
      config={config}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
