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
import { EnglishSpeakButton } from "@/components/EnglishSpeakButton";
import { shuffleArray } from "@/lib/content/generators";

interface ColorNumberItem {
  type: string;
  prompt: string;
  promptHe: string;
  answer: string;
  options: string[];
  emoji: string;
}

function ColorsNumbersPlay({
  items,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  items: ColorNumberItem[];
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
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);
  const [options, setOptions] = useState<string[]>(() =>
    shuffleArray([...items[0].options])
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const item = items[(questionNum - 1) % items.length];

  useEffect(() => {
    setOptions(shuffleArray([...items[(questionNum - 1) % items.length].options]));
    setFeedback(null);
    setAnswered(false);
  }, [questionNum, items]);

  useEffect(() => {
    resetQuestionNum();
    setOptions(shuffleArray([...items[0].options]));
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
  }, [difficulty, items, resetQuestionNum]);

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { questionNum: nextNum, answered: false, feedback: null },
        });
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [project, questionNum, sessionSize, progress, advanceQuestionNum]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setOptions(shuffleArray([...items[0].options]));
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
      state: { questionNum: 1, answered: false, feedback: null },
    });
  }, [progress, items, resetQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (typeof s.questionNum === "number") {
        setQuestionNum(s.questionNum);
        if (s.options) setOptions(s.options as string[]);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
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
      advanceQuestionNum();
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum + 1, answered: false, feedback: null },
      });
    }
  );

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === item.answer) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.colorsCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { questionNum, options, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.colorsWrong", { answer: item.answer }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { questionNum, options, answered: true, feedback: fb },
      });
    }
  };

  const prompt = locale === "he" ? item.promptHe : item.prompt;

  return (
    <GamePage>
      <GameShell
        title={gameTitle("english-beginners", "colors-numbers")}
        emoji="🌈"
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
              <div className="bg-white/90 rounded-2xl p-5 sm:p-8 shadow border-2 border-green-100 text-center">
                <span className="text-6xl">{item.emoji}</span>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <p className="text-xl font-bold text-gray-800">{prompt}</p>
                  <EnglishSpeakButton text={item.answer} />
                </div>
              </div>

              <GameOptionsGrid>
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                    className={`game-btn-option text-lg py-4 ${answered && opt === item.answer ? "correct" : ""} ${answered && opt !== item.answer ? "opacity-50" : ""}`}
                  >
                    {opt}
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
                {questionNum >= sessionSize ? t("common.seeResults") : t("common.continue")}
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

export default function ColorsNumbersPage() {
  const { content, contentError, ready, difficulty, changeDifficulty, progress, lockDifficulty } =
    useGameSession("english-beginners", "colors-numbers");

  const items = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "color-number")
        .map((item) => item.data as unknown as ColorNumberItem),
    [content]
  );

  if (!ready || items.length === 0) {
    return (
      <GameContentGate loading={!ready || items.length === 0} error={contentError}>
        {null}
      </GameContentGate>
    );
  }

  return (
    <ColorsNumbersPlay
      items={items}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
