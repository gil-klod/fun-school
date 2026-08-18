"use client";

import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { ScoreBoard } from "@/components/ScoreBoard";
import { Feedback } from "@/components/Feedback";
import { HEBREW_STORIES } from "@/lib/data/hebrew";

export default function HebrewComprehensionPage() {
  const [storyIndex] = useState(() => Math.floor(Math.random() * HEBREW_STORIES.length));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const story = HEBREW_STORIES[storyIndex];
  const question = story.questions[questionIndex];

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 10 + streak);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", message: "כל הכבוד! Well done!" });
    } else {
      setStreak(0);
      setFeedback({
        type: "wrong",
        message: `The answer was: ${question.options[question.correctIndex]}`,
      });
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= story.questions.length) {
      setFinished(true);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setFeedback(null);
    setAnswered(false);
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title="Story Detective" titleHe="בלש הסיפורים" emoji="🕵️" dir="rtl">
        <ScoreBoard score={score} streak={streak} total={questionIndex + 1} />

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
              message={`Story complete! Final score: ${score} 🌟`}
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
