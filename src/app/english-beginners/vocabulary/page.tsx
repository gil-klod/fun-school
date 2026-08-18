"use client";

import { useState, useCallback } from "react";
import { useRestoreGameState } from "@/hooks/useRestoreGameState";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { BEGINNER_VOCAB, shuffleArray } from "@/lib/data/english-beginners";

function generateQuestion() {
  const correct = BEGINNER_VOCAB[Math.floor(Math.random() * BEGINNER_VOCAB.length)];
  const others = shuffleArray(BEGINNER_VOCAB.filter((v) => v.english !== correct.english)).slice(0, 3);
  const options = shuffleArray([correct, ...others]);
  const askHebrew = Math.random() > 0.5;

  return {
    prompt: askHebrew
      ? `What is "${correct.hebrew}" in English?`
      : `What is "${correct.english}" in Hebrew?`,
    promptHe: askHebrew
      ? `מה זה "${correct.hebrew}" באנגלית?`
      : `מה זה "${correct.english}" בעברית?`,
    correct: askHebrew ? correct.english : correct.hebrew,
    options: askHebrew
      ? options.map((o) => o.english)
      : options.map((o) => o.hebrew),
    emoji: correct.emoji,
  };
}

export default function VocabularyPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "english-beginners", gameId: "vocabulary" });
  const [question, setQuestion] = useState(() => generateQuestion());
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  useRestoreGameState(progress.loaded, progress.resumed, progress.gameState, (s) => {
    if (s.question) {
      setQuestion(s.question as ReturnType<typeof generateQuestion>);
      setAnswered(!!s.answered);
      if (s.feedback) setFeedback(s.feedback as typeof feedback);
    }
  });

  const nextQuestion = useCallback(() => {
    const q = generateQuestion();
    setQuestion(q);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { question: q, answered: false, feedback: null },
    });
  }, [progress]);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);

    if (answer === question.correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.vocabCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { question, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.vocabWrong", { answer: question.correct }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { question, answered: true, feedback: fb },
      });
    }
  };

  if (!progress.loaded) {
    return (
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title={gameTitle("english-beginners", "vocabulary")} emoji="🎯">
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}

        <ScoreBoard score={progress.score} streak={progress.streak} total={progress.round} />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-green-100 mb-6 text-center">
          <span className="text-5xl">{question.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{question.prompt}</p>
          <p className="text-lg text-gray-500 mt-2" dir="rtl">
            {question.promptHe}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`game-btn-option text-lg py-4 ${answered && opt === question.correct ? "correct" : ""} ${answered && opt !== question.correct ? "opacity-50" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextQuestion} className="game-btn game-btn-primary w-full">
            {t("games.nextWord")}
          </button>
        )}
      </GameShell>
    </main>
  );
}
