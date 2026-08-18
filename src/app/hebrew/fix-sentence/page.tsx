"use client";

import { useState, useCallback } from "react";
import { useRestoreGameState } from "@/hooks/useRestoreGameState";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { FIX_SENTENCES } from "@/lib/data/hebrew";

export default function FixSentencePage() {
  const progress = useGameProgress({ subjectId: "hebrew", gameId: "fix-sentence" });
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  useRestoreGameState(progress.loaded, progress.resumed, progress.gameState, (s) => {
    if (s.index !== undefined) {
      setIndex(s.index as number);
      setAnswered(!!s.answered);
      if (s.feedback) setFeedback(s.feedback as typeof feedback);
    }
  });

  const question = FIX_SENTENCES[index % FIX_SENTENCES.length];

  const nextQuestion = useCallback(() => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, answered: false, feedback: null },
    });
  }, [index, progress]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);

    if (option === question.mistake) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = {
        type: "correct" as const,
        message: "נכון! Correct!",
        explanation: question.explanation,
      };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: `The mistake was: "${question.mistake}"`,
        explanation: question.explanation,
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, answered: true, feedback: fb },
      });
    }
  };

  if (!progress.loaded) {
    return (
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title="Fix the Sentence" titleHe="תקן את המשפט" emoji="✏️" dir="rtl">
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}

        <ScoreBoard score={progress.score} streak={progress.streak} total={progress.round} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-blue-100 mb-4 text-center">
          <p className="text-sm text-blue-500 font-medium mb-3">Find the mistake:</p>
          <p className="text-2xl font-bold text-gray-800 leading-relaxed">{question.wrong}</p>
        </div>

        <p className="text-center text-lg font-semibold text-gray-600 mb-4">
          Which word is wrong?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-xl py-4 ${answered && opt === question.mistake ? "correct" : ""} ${answered && opt !== question.mistake ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className="bg-green-50 rounded-2xl p-4 mb-4 border-2 border-green-200" dir="rtl">
            <p className="text-sm text-green-600 font-medium">Correct sentence:</p>
            <p className="text-xl font-bold text-green-800">{question.correct}</p>
          </div>
        )}

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
            Next Sentence →
          </button>
        )}
      </GameShell>
    </main>
  );
}
