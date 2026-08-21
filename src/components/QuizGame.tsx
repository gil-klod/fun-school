"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";
import type { QuizQuestion } from "@/lib/types";

interface QuizGameProps {
  subjectId: string;
  gameId: string;
  backHref: string;
  emoji: string;
  contentDir?: "ltr" | "rtl";
}

function questionKey(question: QuizQuestion): string {
  return question.question;
}

function pickQuestion(
  questions: QuizQuestion[],
  exclude: string[] = []
): QuizQuestion {
  const pool = questions.filter((q) => !exclude.includes(questionKey(q)));
  const list = pool.length > 0 ? pool : questions;
  return list[Math.floor(Math.random() * list.length)];
}

function QuizGamePlay({
  subjectId,
  gameId,
  backHref,
  emoji,
  contentDir,
  questions,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: QuizGameProps & {
  questions: QuizQuestion[];
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
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [question, setQuestion] = useState<QuizQuestion>(() => pickQuestion(questions));
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setUsedQuestions([]);
    setQuestion(pickQuestion(questions));
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [difficulty, questions, resetQuestionNum]);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const q = pickQuestion(questions, currentUsed);
      setQuestion(q);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: {
          question: q,
          usedQuestions: currentUsed,
          answered: false,
          feedback: null,
          questionNum,
        },
      });
    },
    [progress, questions, questionNum]
  );

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedQuestions as string[]) ?? [];
      setUsedQuestions(used);
      if (s.question) {
        setQuestion(s.question as QuizQuestion);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const used = (progress.gameState.usedQuestions as string[]) ?? [];
      const lastKey = (progress.gameState.question as QuizQuestion | undefined)?.question;
      const updatedUsed =
        lastKey && !used.includes(lastKey) ? [...used, lastKey] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setUsedQuestions(updatedUsed);
      progress.setRound((r) => r + 1);
      advanceQuestionNum();
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum + 1 },
      });
      advanceToNext(updatedUsed);
    }
  );

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const key = questionKey(question);
        const used = usedQuestions.includes(key) ? usedQuestions : [...usedQuestions, key];
        const nextNum = questionNum + 1;
        setUsedQuestions(used);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({ round: progress.round + 1, state: { questionNum: nextNum } });
        advanceToNext(used);
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [
    project,
    questionNum,
    sessionSize,
    progress,
    usedQuestions,
    question,
    advanceQuestionNum,
    advanceToNext,
  ]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setUsedQuestions([]);
    const q = pickQuestion(questions);
    setQuestion(q);
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
      state: {
        question: q,
        usedQuestions: [],
        answered: false,
        feedback: null,
        questionNum: 1,
      },
    });
  }, [progress, questions, resetQuestionNum]);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const fb = { type: "correct" as const, message: t("games.correct") };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        question,
        usedQuestions,
        answered: true,
        feedback: fb,
        questionNum,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.wrongAnswer", { answer: question.options[question.correctIndex] }),
        explanation: question.explanation,
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        question,
        usedQuestions,
        answered: true,
        feedback: fb,
        questionNum,
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle(subjectId, gameId)}
        emoji={emoji}
        contentDir={contentDir}
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
              <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-pink-100">
                <p className="text-lg font-bold text-gray-800">{question.question}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.options.map((opt, i) => (
                  <button
                    key={`${question.question}-${i}`}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`game-btn-option text-base py-3 text-left ${answered && i === question.correctIndex ? "correct" : ""} ${answered && i !== question.correctIndex ? "opacity-50" : ""}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
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
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
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

export function QuizGame(props: QuizGameProps) {
  const { subjectId, gameId } = props;
  const session = useGameSession(subjectId, gameId);
  const { content, contentError, ready, difficulty, changeDifficulty, progress, lockDifficulty } =
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
      key={`${difficulty}-${questions.length}`}
      {...props}
      questions={questions}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
