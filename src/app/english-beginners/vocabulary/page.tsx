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
import type { Locale } from "@/i18n/types";

interface VocabPair {
  english: string;
  hebrew: string;
  emoji: string;
}

type VocabQuestion = {
  prompt: string;
  correct: string;
  options: string[];
  emoji: string;
  englishWord: string;
};

function generateQuestion(
  vocab: VocabPair[],
  usedWords: string[],
  _locale: Locale,
  t: (key: string, params?: Record<string, string>) => string
): VocabQuestion {
  const available = vocab.filter((v) => !usedWords.includes(v.english));
  const pool = available.length > 0 ? available : vocab;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffleArray(vocab.filter((v) => v.english !== correct.english)).slice(0, 3);
  const options = shuffleArray([correct, ...others]);
  const askHebrew = Math.random() > 0.5;
  const word = askHebrew ? correct.hebrew : correct.english;

  return {
    prompt: askHebrew
      ? t("games.vocabPromptHeToEn", { word })
      : t("games.vocabPromptEnToHe", { word }),
    correct: askHebrew ? correct.english : correct.hebrew,
    options: askHebrew
      ? options.map((o) => o.english)
      : options.map((o) => o.hebrew),
    emoji: correct.emoji,
    englishWord: correct.english,
  };
}

function VocabularyPlay({
  vocab,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  vocab: VocabPair[];
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
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [question, setQuestion] = useState<VocabQuestion>(() =>
    generateQuestion(vocab, [], locale, t)
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setUsedWords([]);
    setQuestion(generateQuestion(vocab, [], locale, t));
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [difficulty, vocab, locale, t, resetQuestionNum]);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const q = generateQuestion(vocab, currentUsed, locale, t);
      setQuestion(q);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: { question: q, usedWords: currentUsed, answered: false, feedback: null, questionNum },
      });
    },
    [progress, vocab, locale, t, questionNum]
  );

  const nextQuestion = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const used = usedWords.includes(question.englishWord)
          ? usedWords
          : [...usedWords, question.englishWord];
        const nextNum = questionNum + 1;
        setUsedWords(used);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({ round: progress.round + 1, state: { questionNum: nextNum } });
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
    usedWords,
    question.englishWord,
    advanceQuestionNum,
    advanceToNext,
  ]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setUsedWords([]);
    const q = generateQuestion(vocab, [], locale, t);
    setQuestion(q);
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
        question: q,
        usedWords: [],
        answered: false,
        feedback: null,
        questionNum: 1,
      },
    });
  }, [progress, vocab, locale, t, resetQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedWords as string[]) ?? [];
      setUsedWords(used);
      if (s.question) {
        setQuestion(s.question as VocabQuestion);
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const used = (progress.gameState.usedWords as string[]) ?? [];
      const lastWord = (progress.gameState.question as VocabQuestion | undefined)?.englishWord;
      const updatedUsed =
        lastWord && !used.includes(lastWord) ? [...used, lastWord] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setUsedWords(updatedUsed);
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
        state: { question, usedWords, answered: true, feedback: fb, questionNum },
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
        state: { question, usedWords, answered: true, feedback: fb, questionNum },
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("english-beginners", "vocabulary")}
        emoji="🎯"
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
                <span className="text-5xl sm:text-6xl">{question.emoji}</span>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <p className="text-xl font-bold text-gray-800">{question.prompt}</p>
                  <EnglishSpeakButton text={question.englishWord} />
                </div>
              </div>

              <GameOptionsGrid>
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
              </GameOptionsGrid>
            </div>

            {feedback && (
              <div className="mb-4">
                <Feedback type={feedback.type} message={feedback.message} />
              </div>
            )}

            {answered && (
              <button onClick={nextQuestion} className="game-btn game-btn-primary w-full sm:max-w-md sm:mx-auto sm:block">
                {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextWord")}
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

export default function VocabularyPage() {
  const session = useGameSession("english-beginners", "vocabulary");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
    session;

  const vocab = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "vocab")
        .map((item) => item.data as unknown as VocabPair),
    [content]
  );

  if (!ready || vocab.length === 0) {
    return (
      <GameContentGate loading={!ready || vocab.length === 0} error={contentError}>
        {null}
      </GameContentGate>
    );
  }

  return (
    <VocabularyPlay
      vocab={vocab}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
