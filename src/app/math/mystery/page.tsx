"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameContentGate } from "@/components/GameContentGate";
import { sessionQuestion } from "@/lib/session";
import { useLocale } from "@/i18n/LocaleProvider";
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
}: {
  templates: MysteryTemplate[];
  config: MysteryConfig;
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle, locale } = useLocale();
  const [round, setRound] = useState(() => newRound(templates, config));
  const { question, options } = round;
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setRound(newRound(templates, config));
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
  }, [difficulty, templates, config]);

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
      }
    },
    () => {
      progress.setRound((r) => r + 1);
      const newR = newRound(templates, config);
      setRound(newR);
      setFeedback(null);
      setAnswered(false);
      setShowHint(false);
      progress.save({
        round: progress.round + 1,
        state: { round: newR, answered: false, feedback: null, showHint: false },
      });
    }
  );

  const correct = question.answer;

  const nextQuestion = useCallback(() => {
    const newR = newRound(templates, config);
    setRound(newR);
    setFeedback(null);
    setAnswered(false);
    setShowHint(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { round: newR, answered: false, feedback: null, showHint: false },
    });
  }, [progress, templates, config]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    setAnswered(true);

    if (answer === correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.mysteryCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { round, answered: true, feedback: fb, showHint },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.mysteryWrong", { answer: correct }),
        explanation: getMysteryHint(question, locale),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { round, answered: true, feedback: fb, showHint },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/math" />

      <GameShell title={gameTitle("math", "mystery")} emoji="🔍">
        <DifficultySelector
          value={difficulty}
          onChange={changeDifficulty}
          disabled={answered}
        />

        <GameStatus
          current={sessionQuestion(progress.round)}
          total={sessionSize}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-purple-100 mb-3">
          <p className="text-lg font-medium text-gray-800">{getMysteryText(question, locale)}</p>
        </div>

        {!showHint && !answered && (
          <button
            onClick={() => {
              setShowHint(true);
              progress.save({ state: { round, answered, feedback, showHint: true } });
            }}
            className="text-indigo-500 font-semibold mb-4 hover:text-indigo-700 transition-colors"
          >
            {t("games.needHint")}
          </button>
        )}
        {showHint && !answered && (
          <div className="mb-4">
            <Feedback type="info" message={getMysteryHint(question, locale)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-2xl py-5 ${answered && opt === correct ? "correct" : ""} ${answered && opt !== correct ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
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
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            {t("games.nextMystery")}
          </button>
        )}
      </GameShell>
    </main>
  );
}

export default function MysteryPage() {
  const session = useGameSession("math", "mystery");
  const { ready, content, contentLoading, contentError, difficulty, changeDifficulty, progress } =
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
        loading={!ready || contentLoading || !config || templates.length === 0}
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
    />
  );
}
