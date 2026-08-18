"use client";

import { useState } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { ENGLISH_STORIES } from "@/lib/data/english-natives";

export default function EnglishComprehensionPage() {
  const { t, gameTitle } = useLocale();
  const progress = useGameProgress({ subjectId: "english-natives", gameId: "comprehension" });
  const [storyIndex, setStoryIndex] = useState(() =>
    Math.floor(Math.random() * ENGLISH_STORIES.length)
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
    explanation?: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.storyIndex !== undefined) setStoryIndex(s.storyIndex as number);
      if (s.questionIndex !== undefined) setQuestionIndex(s.questionIndex as number);
      setFinished(!!s.finished);
      setAnswered(!!s.answered);
      if (s.feedback) setFeedback(s.feedback as typeof feedback);
    },
    () => {
      const s = progress.gameState;
      const storyIdx = s.storyIndex as number;
      const qIdx = s.questionIndex as number;
      const story = ENGLISH_STORIES[storyIdx];
      if (qIdx + 1 >= story.questions.length) {
        setFinished(true);
        progress.markCompleted();
        progress.save({
          state: { storyIndex: storyIdx, questionIndex: qIdx, finished: true, answered: false, feedback: null },
          status: "completed",
        });
      } else {
        const nextIdx = qIdx + 1;
        setStoryIndex(storyIdx);
        setQuestionIndex(nextIdx);
        setFeedback(null);
        setAnswered(false);
        setFinished(false);
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { storyIndex: storyIdx, questionIndex: nextIdx, finished: false, answered: false, feedback: null },
        });
      }
    }
  );

  const story = ENGLISH_STORIES[storyIndex];
  const question = story.questions[questionIndex];

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.storyCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { storyIndex, questionIndex, finished, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.storyWrong", { answer: question.options[question.correctIndex] }),
        explanation: question.explanation,
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { storyIndex, questionIndex, finished, answered: true, feedback: fb },
      });
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= story.questions.length) {
      setFinished(true);
      progress.markCompleted();
      progress.save({
        state: { storyIndex, questionIndex, finished: true, answered, feedback },
        status: "completed",
      });
      return;
    }
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { storyIndex, questionIndex: nextIdx, finished: false, answered: false, feedback: null },
    });
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/english-natives" />

      <GameShell title={gameTitle("english-natives", "comprehension")} emoji="📚" contentDir="ltr">
        <GameStatus
          current={questionIndex + 1}
          total={story.questions.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-3xl p-6 shadow-lg border-2 border-pink-100 mb-4">
          <h2 className="text-xl font-bold text-pink-700 mb-3">{story.title}</h2>
          <p className="text-lg leading-relaxed text-gray-800">{story.text}</p>
        </div>

        {!finished ? (
          <>
            <p className="text-xl font-bold text-center text-gray-700 mb-4">
              {question.question}
            </p>

            <div className="grid grid-cols-1 gap-3 mb-4">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`game-btn-option text-lg py-4 text-left ${answered && i === question.correctIndex ? "correct" : ""} ${answered && i !== question.correctIndex ? "opacity-50" : ""}`}
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
                {questionIndex + 1 >= story.questions.length ? t("common.seeResults") : t("common.nextQuestion")}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Feedback
              type="correct"
              message={t("games.storyComplete", { score: progress.score })}
            />
            <button
              onClick={() => window.location.reload()}
              className="game-btn game-btn-primary w-full mt-4"
            >
              {t("games.readAnother")}
            </button>
          </div>
        )}
      </GameShell>
    </main>
  );
}
