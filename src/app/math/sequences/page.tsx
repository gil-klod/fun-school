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
import { newSequenceRound } from "@/lib/content/generators";
import type { SequencesConfig } from "@/lib/content/types";

function SequencesPlay({
  config,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  config: SequencesConfig;
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
  const [round, setRound] = useState(() => newSequenceRound(config));
  const { question, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setRound(newSequenceRound(config));
    setFeedback(null);
    setAnswered(false);
    resetQuestionNum();
  }, [difficulty, config, resetQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.round) {
        setRound(s.round as ReturnType<typeof newSequenceRound>);
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
      const newR = newSequenceRound(config);
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

  const correct = question.answer;

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        const newR = newSequenceRound(config);
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
  }, [project, progress, config, questionNum, sessionSize, advanceQuestionNum]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    const newR = newSequenceRound(config);
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
  }, [progress, config, resetQuestionNum]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const fb = { type: "correct" as const, message: t("games.sequencesCorrect") };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        round,
        answered: true,
        feedback: fb,
        questionNum,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.sequencesWrong", { answer: correct }),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        round,
        answered: true,
        feedback: fb,
        questionNum,
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("math", "sequences")}
        emoji="🔢"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-center">
              <div className="bg-white/90 rounded-2xl p-6 shadow border-2 border-amber-100 text-center">
                <p className="text-lg font-semibold text-gray-700 mb-4">{t("games.whatComesNext")}</p>
                <p className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-wide">
                  <MathLtr>
                    {question.numbers.join(", ")}, ?
                  </MathLtr>
                </p>
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
                <Feedback type={feedback.type} message={feedback.message} />
              </div>
            )}

            {answered && (
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextSequence")}
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

export default function SequencesPage() {
  const session = useGameSession("math", "sequences");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
    session;

  const config = useMemo(
    () => (content?.config ?? null) as SequencesConfig | null,
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
    <SequencesPlay
      config={config}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
