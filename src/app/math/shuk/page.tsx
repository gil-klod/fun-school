"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage, GameOptionsGrid } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { MathLtr } from "@/components/MathLtr";
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";
import {
  buildOptions,
  getShukItemName,
  normalizeShukRound,
  type ShukItem,
} from "@/lib/content/generators";
import type { ShukConfig } from "@/lib/content/types";

function newChallenge(items: ShukItem[], config: ShukConfig) {
  return normalizeShukRound(null, items, config);
}

function ShukPlay({
  items,
  config,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  items: ShukItem[];
  config: ShukConfig;
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
  lockDifficulty?: boolean;
}) {
  const { t, gameTitle, locale } = useLocale();
  const project = useProjectGame();
  const [slotDone, setSlotDone] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [round, setRound] = useState(() => newChallenge(items, config));
  const { challenge, options } = useMemo(
    () => normalizeShukRound(round, items, config),
    [round, items, config]
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setRound(newChallenge(items, config));
    setFeedback(null);
    setAnswered(false);
    resetQuestionNum();
  }, [difficulty, items, config, resetQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.round) {
        setRound(normalizeShukRound(s.round, items, config));
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      progress.setRound((r) => r + 1);
      const newR = newChallenge(items, config);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      advanceQuestionNum();
      progress.save({
        round: progress.round + 1,
        state: {
          round: newR,
          answered: false,
          feedback: null,
          questionNum: savedNum + 1,
        },
      });
    }
  );

  const correct = challenge.change;

  const nextChallenge = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        const newR = newChallenge(items, config);
        setRound(newR);
        setFeedback(null);
        setAnswered(false);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { round: newR, answered: false, feedback: null, questionNum: nextNum },
        });
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [project, progress, items, config, questionNum, sessionSize, advanceQuestionNum]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    const newR = newChallenge(items, config);
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
      state: { round: newR, answered: false, feedback: null, questionNum: 1 },
    });
  }, [progress, items, config, resetQuestionNum]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.shukCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { round, answered: true, feedback: fb, questionNum },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.shukWrong", {
          change: correct,
          total: challenge.total,
          paid: challenge.paid,
        }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { round, answered: true, feedback: fb, questionNum },
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("math", "shuk")}
        emoji="🛒"
        difficulty={difficulty}
        onDifficultyChange={changeDifficulty}
        difficultyDisabled={answered || lockDifficulty}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-amber-100">
                <p className="text-base font-semibold text-amber-700 mb-3">{t("games.shoppingList")}</p>
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-1 items-center text-sm text-amber-800/80 mb-1 px-1">
                  <span aria-hidden className="w-7" />
                  <span className="font-semibold">{t("games.shukItem")}</span>
                  <span className="font-semibold text-center min-w-[2.5rem]">{t("games.shukQuantity")}</span>
                  <span className="font-semibold text-end min-w-[4rem]">{t("games.shukUnitPrice")}</span>
                </div>
                <div className="space-y-2">
                  {challenge.lines.map((line, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-0 items-center bg-amber-50 rounded-xl px-3 py-2"
                    >
                      <span className="text-xl w-7 text-center shrink-0">{line.item.emoji}</span>
                      <span className="font-medium min-w-0 truncate">
                        {getShukItemName(line.item, locale)}
                      </span>
                      <MathLtr className="font-bold text-center min-w-[2.5rem]">{line.quantity}</MathLtr>
                      <MathLtr className="font-bold text-amber-700 text-end min-w-[4rem]">
                        ₪{line.item.price}
                      </MathLtr>
                    </div>
                  ))}
                </div>
                <div className="border-t border-amber-200 mt-3 pt-3 flex justify-between text-base gap-2">
                  <span className="font-semibold">{t("games.youPay")}</span>
                  <MathLtr className="font-bold text-green-700">₪{challenge.paid}</MathLtr>
                </div>
              </div>

              <div>
                <p className="text-center text-lg sm:text-xl font-bold text-gray-700 mb-4">
                  {t("games.howMuchChange")}
                </p>
                <GameOptionsGrid>
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                      className={`game-btn-option text-xl py-4 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
                    >
                      <MathLtr>₪{opt}</MathLtr>
                    </button>
                  ))}
                </GameOptionsGrid>
              </div>
            </div>

            {feedback && (
              <div className="mb-4">
                <Feedback type={feedback.type} message={feedback.message} />
              </div>
            )}

            {answered && (
              <button onClick={nextChallenge} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextShopping")}
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

export default function ShukPage() {
  const session = useGameSession("math", "shuk");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
    session;

  const items = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "shuk-item")
        .map((item) => item.data as unknown as ShukItem),
    [content]
  );

  const config = useMemo(
    () => (content?.config ?? null) as ShukConfig | null,
    [content]
  );

  if (!ready || !config || items.length === 0) {
    return (
      <GameContentGate
        loading={!ready || !config || items.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <ShukPlay
      items={items}
      config={config}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
