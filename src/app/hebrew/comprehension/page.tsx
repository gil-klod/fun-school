"use client";

import { useState, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { SessionComplete } from "@/components/SessionComplete";
import { SpeakButton } from "@/components/EnglishSpeakButton";
import { stopSpeaking } from "@/components/mascot/speech";
import { useLocale } from "@/i18n/LocaleProvider";

interface HebrewStory {
  title: string;
  text: string;
  titleNikud?: string;
  textNikud?: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

function HebrewComprehensionPlay({
  stories,
  difficulty,
  changeDifficulty,
  progress,
}: {
  stories: HebrewStory[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle } = useLocale();
  const [storyIndex, setStoryIndex] = useState(() =>
    Math.floor(Math.random() * stories.length)
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showNikud, setShowNikud] = useState(false);

  useEffect(() => {
    setStoryIndex(Math.floor(Math.random() * stories.length));
    setQuestionIndex(0);
    setFeedback(null);
    setAnswered(false);
    setFinished(false);
  }, [difficulty, stories.length]);

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
      const story = stories[storyIdx];
      if (qIdx + 1 >= story.questions.length) {
        setFinished(true);
        progress.markCompleted();
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
          state: {
            storyIndex: storyIdx,
            questionIndex: nextIdx,
            finished: false,
            answered: false,
            feedback: null,
          },
        });
      }
    }
  );

  const story = stories[storyIndex];
  const question = story.questions[questionIndex];
  const hasNikud = Boolean(story.titleNikud && story.textNikud);
  const displayTitle = showNikud && story.titleNikud ? story.titleNikud : story.title;
  const displayText = showNikud && story.textNikud ? story.textNikud : story.text;
  const storySpeech = `${displayTitle}. ${displayText}`;

  useEffect(() => {
    return () => stopSpeaking();
  }, [storyIndex, difficulty, displayTitle, displayText]);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      const fb = { type: "correct" as const, message: t("games.storyCorrect") };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        storyIndex,
        questionIndex,
        finished,
        answered: true,
        feedback: fb,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.storyWrong", { answer: question.options[question.correctIndex] }),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        storyIndex,
        questionIndex,
        finished,
        answered: true,
        feedback: fb,
      });
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= story.questions.length) {
      setFinished(true);
      progress.markCompleted();
      return;
    }
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: {
        storyIndex,
        questionIndex: nextIdx,
        finished: false,
        answered: false,
        feedback: null,
      },
    });
  };

  const readAnother = () => {
    const newStoryIndex = Math.floor(Math.random() * stories.length);
    setStoryIndex(newStoryIndex);
    setQuestionIndex(0);
    setFeedback(null);
    setAnswered(false);
    setFinished(false);
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
        storyIndex: newStoryIndex,
        questionIndex: 0,
        finished: false,
        answered: false,
        feedback: null,
      },
    });
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("hebrew", "comprehension")}
        emoji="🕵️"
        contentDir="rtl"
        difficulty={difficulty}
        onDifficultyChange={changeDifficulty}
        difficultyDisabled={answered && !finished}
      >
        <GameStatus
          current={questionIndex + 1}
          total={story.questions.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4 items-start">
          <div className="bg-white/90 rounded-2xl p-5 sm:p-6 shadow border-2 border-blue-100 xl:max-h-[28rem] xl:overflow-y-auto">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <h2 className="text-xl font-bold text-blue-700">{displayTitle}</h2>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <SpeakButton text={storySpeech} locale="he" />
                {hasNikud && (
                  <button
                    type="button"
                    onClick={() => setShowNikud((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      showNikud
                        ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-600"
                        : "bg-white border-2 border-blue-200 text-blue-700 hover:border-blue-400"
                    }`}
                    aria-pressed={showNikud}
                    aria-label={showNikud ? t("games.hideNikud") : t("games.showNikud")}
                    title={showNikud ? t("games.hideNikud") : t("games.showNikud")}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      אָ
                    </span>
                    <span>{showNikud ? t("games.hideNikud") : t("games.showNikud")}</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-lg leading-relaxed text-gray-800">{displayText}</p>
          </div>

          {!finished ? (
            <div>
              <p className="text-xl font-bold text-gray-700 mb-4">{question.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
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
                  {questionIndex + 1 >= story.questions.length
                    ? t("common.seeResults")
                    : t("common.nextQuestion")}
                </button>
              )}
            </div>
          ) : (
            <SessionComplete
              score={progress.score}
              message={t("games.storyComplete", { score: progress.score })}
              playAgainLabel={t("games.readAnother")}
              onPlayAgain={readAnother}
            />
          )}
        </div>
      </GameShell>
    </GamePage>
  );
}

export default function HebrewComprehensionPage() {
  const session = useGameSession("hebrew", "comprehension");
  const { ready, content, contentError, difficulty, changeDifficulty, progress } =
    session;

  const stories = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "story")
        .map((item) => item.data as unknown as HebrewStory),
    [content]
  );

  if (!ready || stories.length === 0) {
    return (
      <GameContentGate loading={!ready || stories.length === 0} error={contentError}>
        {null}
      </GameContentGate>
    );
  }

  return (
    <HebrewComprehensionPlay
      stories={stories}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
