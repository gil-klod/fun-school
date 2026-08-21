"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { SpeakButton, WordWithSpeaker } from "@/components/EnglishSpeakButton";
import { shuffleArray } from "@/lib/content/generators";

interface ColorNumberItem {
  type: string;
  prompt: string;
  promptHe: string;
  answer: string;
  options: string[];
  emoji: string;
}

const CATEGORY_I18N: Record<string, keyof import("@/i18n/types").Dictionary["games"]> = {
  color: "wordCategoryColor",
  number: "wordCategoryNumber",
  shape: "wordCategoryShape",
  food: "wordCategoryFood",
  vehicle: "wordCategoryVehicle",
  animal: "wordCategoryAnimal",
  body: "wordCategoryBody",
  clothing: "wordCategoryClothing",
  school: "wordCategorySchool",
  weather: "wordCategoryWeather",
  home: "wordCategoryHome",
  sport: "wordCategorySport",
};

function itemKey(item: ColorNumberItem): string {
  return `${item.type}::${item.answer}`;
}

function pickItem(items: ColorNumberItem[], usedKeys: string[]): ColorNumberItem {
  const available = items.filter((item) => !usedKeys.includes(itemKey(item)));
  const pool = available.length > 0 ? available : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function createRandomQuestion(items: ColorNumberItem[], usedKeys: string[] = []) {
  const item = pickItem(items, usedKeys);
  return { item, options: shuffleArray([...item.options]) };
}

function optionsForItem(item: ColorNumberItem, saved?: string[]): string[] {
  if (
    saved &&
    saved.length === item.options.length &&
    saved.includes(item.answer) &&
    saved.every((opt) => item.options.includes(opt))
  ) {
    return saved;
  }
  return shuffleArray([...item.options]);
}

function findItem(items: ColorNumberItem[], key: string): ColorNumberItem | undefined {
  return items.find((item) => itemKey(item) === key);
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
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [question, setQuestion] = useState(() => createRandomQuestion(items));
  const currentItem = question.item;
  const options = question.options;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const prevDifficultyRef = useRef(difficulty);
  const initializedRef = useRef(false);

  const resetSession = useCallback(() => {
    setUsedKeys([]);
    setQuestion(createRandomQuestion(items));
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [items, resetQuestionNum]);

  const advanceToNext = useCallback(
    (used: string[]) => {
      const next = createRandomQuestion(items, used);
      setUsedKeys(used);
      setQuestion(next);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: {
          currentKey: itemKey(next.item),
          usedKeys: used,
          answered: false,
          feedback: null,
          questionNum,
        },
      });
    },
    [items, progress, questionNum]
  );

  useEffect(() => {
    if (!progress.loaded) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!progress.hasSavedProgress) {
        resetSession();
      }
      return;
    }

    if (prevDifficultyRef.current !== difficulty) {
      prevDifficultyRef.current = difficulty;
      resetSession();
    }
  }, [progress.loaded, progress.hasSavedProgress, difficulty, resetSession]);

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const key = itemKey(currentItem);
        const used = usedKeys.includes(key) ? usedKeys : [...usedKeys, key];
        const nextNum = questionNum + 1;
        setUsedKeys(used);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { questionNum: nextNum },
        });
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
    currentItem,
    usedKeys,
    advanceQuestionNum,
    advanceToNext,
  ]);

  const playAgain = useCallback(() => {
    const first = createRandomQuestion(items);
    setSessionComplete(false);
    resetQuestionNum();
    setUsedKeys([]);
    setQuestion(first);
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
        questionNum: 1,
        currentKey: itemKey(first.item),
        usedKeys: [],
        answered: false,
        feedback: null,
      },
    });
  }, [progress, items, resetQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedKeys as string[]) ?? [];
      setUsedKeys(used);

      if (typeof s.questionNum === "number") {
        setQuestionNum(s.questionNum);
      }

      const savedKey = typeof s.currentKey === "string" ? s.currentKey : null;
      const restored = savedKey ? findItem(items, savedKey) : undefined;

      if (restored) {
        setQuestion({
          item: restored,
          options: optionsForItem(restored, s.options as string[] | undefined),
        });
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        return;
      }

      // Legacy saves (fixed order / old deck) — start a fresh random session.
      const first = createRandomQuestion(items);
      setUsedKeys([]);
      setQuestion(first);
      setAnswered(false);
      setFeedback(null);
      setQuestionNum(1);
      progress.save({
        state: {
          questionNum: 1,
          currentKey: itemKey(first.item),
          usedKeys: [],
          answered: false,
          feedback: null,
        },
      });
    },
    () => {
      const used = (progress.gameState.usedKeys as string[]) ?? [];
      const lastKey = progress.gameState.currentKey as string | undefined;
      const updatedUsed =
        lastKey && !used.includes(lastKey) ? [...used, lastKey] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setUsedKeys(updatedUsed);
      progress.setRound((r) => r + 1);
      advanceQuestionNum();
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum + 1 },
      });
      advanceToNext(updatedUsed);
    }
  );

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === currentItem.answer) {
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
        state: {
          questionNum,
          currentKey: itemKey(currentItem),
          usedKeys,
          options,
          answered: true,
          feedback: fb,
        },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.colorsWrong", { answer: currentItem.answer }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: {
          questionNum,
          currentKey: itemKey(currentItem),
          usedKeys,
          options,
          answered: true,
          feedback: fb,
        },
      });
    }
  };

  const prompt = locale === "he" ? currentItem.promptHe : currentItem.prompt;
  const categoryKey = CATEGORY_I18N[currentItem.type];
  const categoryLabel = categoryKey ? t(`games.${categoryKey}`) : currentItem.type;

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
                <span className="inline-block mb-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  {categoryLabel}
                </span>
                <span className="block text-6xl">{currentItem.emoji}</span>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="text-xl font-bold text-gray-800">{prompt}</p>
                  <SpeakButton text={prompt} locale={locale} />
                </div>
              </div>

              <GameOptionsGrid>
                {options.map((opt) => (
                  <WordWithSpeaker
                    key={opt}
                    word={opt}
                    speakLocale="en"
                    disabled={answered}
                    onWordClick={() => handleAnswer(opt)}
                    wordClassName={`game-btn-option w-full text-lg py-4 ${answered && opt === currentItem.answer ? "correct" : ""} ${answered && opt !== currentItem.answer ? "opacity-50" : ""}`}
                  />
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
      key={`${difficulty}-${items.length}`}
      items={items}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
