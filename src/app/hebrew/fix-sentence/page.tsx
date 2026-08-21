"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage, GameOptionsGrid } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";
import {
  getFixSentenceExplanation,
  getFixSentenceReplacement,
  type FixSentenceQuestion,
} from "@/lib/data/hebrew";

function sentenceKey(question: FixSentenceQuestion): string {
  return question.wrong;
}

function pickSentence(
  sentences: FixSentenceQuestion[],
  exclude: string[] = []
): FixSentenceQuestion {
  const pool = sentences.filter((s) => !exclude.includes(sentenceKey(s)));
  const list = pool.length > 0 ? pool : sentences;
  return list[Math.floor(Math.random() * list.length)];
}

function HighlightedWrongSentence({
  text,
  mistake,
}: {
  text: string;
  mistake: string;
}) {
  const parts = text.split(/(\s+)/);
  return (
    <p className="text-2xl font-bold text-gray-800 leading-relaxed">
      {parts.map((part, index) => {
        const word = part.replace(/[.,!?;:]+$/g, "");
        const suffix = part.slice(word.length);
        if (word === mistake) {
          return (
            <span
              key={`${index}-${part}`}
              className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-lg underline decoration-red-500 decoration-2"
            >
              {word}
              {suffix}
            </span>
          );
        }
        return <span key={`${index}-${part}`}>{part}</span>;
      })}
    </p>
  );
}

function FixSentencePlay({
  sentences,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  sentences: FixSentenceQuestion[];
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
  const [usedSentences, setUsedSentences] = useState<string[]>([]);
  const [question, setQuestion] = useState<FixSentenceQuestion>(() =>
    pickSentence(sentences)
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setUsedSentences([]);
    setQuestion(pickSentence(sentences));
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [difficulty, sentences, resetQuestionNum]);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const q = pickSentence(sentences, currentUsed);
      setQuestion(q);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: {
          question: q,
          usedSentences: currentUsed,
          answered: false,
          feedback: null,
          questionNum,
        },
      });
    },
    [progress, sentences, questionNum]
  );

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedSentences as string[]) ?? [];
      setUsedSentences(used);
      if (s.question) {
        setQuestion(s.question as FixSentenceQuestion);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const used = (progress.gameState.usedSentences as string[]) ?? [];
      const lastKey = (progress.gameState.question as FixSentenceQuestion | undefined)?.wrong;
      const updatedUsed =
        lastKey && !used.includes(lastKey) ? [...used, lastKey] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setUsedSentences(updatedUsed);
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
        const used = usedSentences.includes(sentenceKey(question))
          ? usedSentences
          : [...usedSentences, sentenceKey(question)];
        const nextNum = questionNum + 1;
        setUsedSentences(used);
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
    usedSentences,
    question.wrong,
    advanceQuestionNum,
    advanceToNext,
  ]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setUsedSentences([]);
    const q = pickSentence(sentences);
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
        usedSentences: [],
        answered: false,
        feedback: null,
        questionNum: 1,
      },
    });
  }, [progress, sentences, resetQuestionNum]);

  const correctWord = getFixSentenceReplacement(question);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);

    if (option === correctWord) {
      const fb = {
        type: "correct" as const,
        message: t("games.fixCorrect"),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        question,
        usedSentences,
        answered: true,
        feedback: fb,
        questionNum,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.fixWrong", { word: correctWord }),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        question,
        usedSentences,
        answered: true,
        feedback: fb,
        questionNum,
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
                <div className="bg-white/90 rounded-2xl p-5 shadow border-2 border-blue-100 text-center">
                  <p className="text-sm text-blue-500 font-medium mb-3">{t("games.findMistake")}</p>
                  <HighlightedWrongSentence text={question.wrong} mistake={question.mistake} />
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
                    className={`game-btn-option text-xl py-4 ${answered && opt === correctWord ? "correct" : ""} ${answered && opt !== correctWord ? "opacity-50" : ""}`}
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
                {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextSentence")}
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
      key={`${difficulty}-${sentences.length}`}
      sentences={sentences}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
