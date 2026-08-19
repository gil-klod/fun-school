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
}: {
  items: ShukItem[];
  config: ShukConfig;
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle, locale } = useLocale();
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
          questionNum: savedNum >= sessionSize ? 1 : savedNum + 1,
        },
      });
    }
  );

  const correct = challenge.change;

  const nextChallenge = useCallback(() => {
    const nextNum = questionNum >= sessionSize ? 1 : questionNum + 1;
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
  }, [progress, items, config, questionNum, sessionSize, advanceQuestionNum]);

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
        difficultyDisabled={answered}
      >
        <GameStatus
          current={questionNum}
          total={sessionSize}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-amber-100">
            <p className="text-base font-semibold text-amber-700 mb-3">{t("games.shoppingList")}</p>
            <div className="space-y-2">
              {challenge.lines.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2 gap-2"
                >
                  <span className="text-xl shrink-0">{line.item.emoji}</span>
                  <span className="font-medium flex-1 min-w-0 truncate">
                    {line.quantity > 1
                      ? `${line.quantity} × ${getShukItemName(line.item, locale)}`
                      : getShukItemName(line.item, locale)}
                  </span>
                  <MathLtr className="font-bold text-amber-700 shrink-0">
                    ₪{line.item.price * line.quantity}
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
            {t("games.nextShopping")}
          </button>
        )}
      </GameShell>
    </GamePage>
  );
}

export default function ShukPage() {
  const session = useGameSession("math", "shuk");
  const { ready, content, contentError, difficulty, changeDifficulty, progress } =
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
    />
  );
}
