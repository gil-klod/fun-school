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
  generateMystery,
  buildOptions,
  getMysteryText,
  getMysteryHint,
  type MysteryTemplate,
} from "@/lib/content/generators";
import type { MysteryConfig } from "@/lib/content/types";

function newRound(templates: MysteryTemplate[], config: MysteryConfig) {
  const q = generateMystery(templates, config);
  return { question: q, options: buildOptions(q.answer) };
}

function MysteryPlay({
  templates,
  config,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  templates: MysteryTemplate[];
  config: MysteryConfig;
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
  const [round, setRound] = useState(() => newRound(templates, config));
  const { question, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setRound(newRound(templates, config));
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
    resetQuestionNum();
  }, [difficulty, templates, config, resetQuestionNum]);

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
      const newR = newRound(templates, config);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      setShowHint(false);
      advanceQuestionNum();
      progress.save({
        round: progress.round + 1,
        state: {
          round: newR,
          answered: false,
          feedback: null,
          showHint: false,
          questionNum: savedNum + 1,
        },
      });
    }
  );

  const correct = question.answer;

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        const newR = newRound(templates, config);
        setRound(newR);
        setFeedback(null);
        setAnswered(false);
        setShowHint(false);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { round: newR, answered: false, feedback: null, showHint: false, questionNum: nextNum },
        });
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [project, progress, templates, config, questionNum, sessionSize, advanceQuestionNum]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    const newR = newRound(templates, config);
    setRound(newR);
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
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
      state: { round: newR, answered: false, feedback: null, showHint: false, questionNum: 1 },
    });
  }, [progress, templates, config, resetQuestionNum]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const fb = { type: "correct" as const, message: t("games.mysteryCorrect") };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        round,
        answered: true,
        feedback: fb,
        showHint,
        questionNum,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.mysteryWrong", { answer: correct }),
        explanation: getMysteryHint(question, locale),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        round,
        answered: true,
        feedback: fb,
        showHint,
        questionNum,
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("math", "mystery")}
        emoji="🔍"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
              <div>
                <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-purple-100 mb-3">
                  <p className="text-lg font-medium text-gray-800">{getMysteryText(question, locale)}</p>
                </div>

                {!showHint && !answered && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      progress.save({ state: { round, answered, feedback, showHint: true, questionNum } });
                    }}
                    className="text-indigo-500 font-semibold mb-2 hover:text-indigo-700 transition-colors"
                  >
                    {t("games.needHint")}
                  </button>
                )}
                {showHint && !answered && (
                  <Feedback type="info" message={getMysteryHint(question, locale)} />
                )}
              </div>

              <GameOptionsGrid>
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                    className={`game-btn-option text-2xl py-5 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
                  >
                    <MathLtr>{opt}</MathLtr>
                  </button>
                ))}
              </GameOptionsGrid>
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
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextMystery")}
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

export default function MysteryPage() {
  const session = useGameSession("math", "mystery");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
    session;

  const templates = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "mystery-template")
        .map((item) => item.data as unknown as MysteryTemplate),
    [content]
  );

  const config = useMemo(
    () => (content?.config ?? null) as MysteryConfig | null,
    [content]
  );

  if (!ready || !config || templates.length === 0) {
    return (
      <GameContentGate
        loading={!ready || !config || templates.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <MysteryPlay
      templates={templates}
      config={config}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
