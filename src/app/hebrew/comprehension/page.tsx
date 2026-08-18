"use client";

import { useState } from "react";
import { useRestoreGameState } from "@/hooks/useRestoreGameState";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { HEBREW_STORIES } from "@/lib/data/hebrew";

export default function HebrewComprehensionPage() {
  const progress = useGameProgress({ subjectId: "hebrew", gameId: "comprehension" });
  const [storyIndex, setStoryIndex] = useState(() =>
    Math.floor(Math.random() * HEBREW_STORIES.length)
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  useRestoreGameState(progress.loaded, progress.resumed, progress.gameState, (s) => {
    if (s.storyIndex !== undefined) setStoryIndex(s.storyIndex as number);
    if (s.questionIndex !== undefined) setQuestionIndex(s.questionIndex as number);
    setFinished(!!s.finished);
    setAnswered(!!s.answered);
    if (s.feedback) setFeedback(s.feedback as typeof feedback);
  });

  const story = HEBREW_STORIES[storyIndex];
  const question = story.questions[questionIndex];

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: "כל הכבוד! Well done!" };
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
        message: `The answer was: ${question.options[question.correctIndex]}`,
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

      <GameShell title="Story Detective" titleHe="בלש הסיפורים" emoji="🕵️" dir="rtl">
        {progress.resumed && <ResumeNotice onDismiss={progress.dismissResume} />}

        <ScoreBoard score={progress.score} streak={progress.streak} total={questionIndex + 1} />

        <div className="bg-white/90 rounded-3xl p-6 shadow-lg border-2 border-blue-100 mb-6">
          <h2 className="text-xl font-bold text-blue-700 mb-3">{story.title}</h2>
          <p className="text-lg leading-relaxed text-gray-800">{story.text}</p>
        </div>

        {!finished ? (
          <>
            <p className="text-xl font-bold text-center text-gray-700 mb-4">
              {question.question}
            </p>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`game-btn-option text-lg py-4 text-right ${answered && i === question.correctIndex ? "correct" : ""} ${answered && i !== question.correctIndex ? "opacity-50" : ""}`}
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
                {questionIndex + 1 >= story.questions.length ? "See Results →" : "Next Question →"}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Feedback
              type="correct"
              message={`Story complete! Final score: ${progress.score} 🌟`}
            />
            <button
              onClick={() => window.location.reload()}
              className="game-btn game-btn-primary w-full mt-4"
            >
              Read Another Story
            </button>
          </div>
        )}
      </GameShell>
    </main>
  );
}
