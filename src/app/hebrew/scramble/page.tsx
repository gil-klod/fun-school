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
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  getWordHint,
  getWordCategory,
  newScrambleWord,
  type HebrewWord,
} from "@/lib/content/hebrew-helpers";

type WordData = HebrewWord & { scrambled: string };

function ScramblePlay({
  words,
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
}: {
  words: HebrewWord[];
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle, locale } = useLocale();
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [wordData, setWordData] = useState<WordData>(() => newScrambleWord(words));
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);

  useEffect(() => {
    setUsedWords([]);
    setWordData(newScrambleWord(words));
    setGuess("");
    setFeedback(null);
    setAnswered(false);
    resetQuestionNum();
  }, [difficulty, words, resetQuestionNum]);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const w = newScrambleWord(words, currentUsed);
      setWordData(w);
      setGuess("");
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: {
          wordData: w,
          usedWords: currentUsed,
          guess: "",
          answered: false,
          feedback: null,
          questionNum,
        },
      });
    },
    [progress, words, questionNum]
  );

  const nextWord = useCallback(() => {
    const used = usedWords.includes(wordData.word)
      ? usedWords
      : [...usedWords, wordData.word];
    const nextNum = questionNum >= sessionSize ? 1 : questionNum + 1;
    setUsedWords(used);
    advanceQuestionNum();
    progress.setRound((r) => r + 1);
    progress.save({ round: progress.round + 1, state: { questionNum: nextNum } });
    advanceToNext(used);
  }, [usedWords, wordData.word, progress, advanceToNext, questionNum, sessionSize, advanceQuestionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedWords as string[]) ?? [];
      setUsedWords(used);
      if (s.wordData) {
        setWordData(s.wordData as WordData);
        setGuess((s.guess as string) ?? "");
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
        if (typeof s.questionNum === "number") setQuestionNum(s.questionNum);
      }
    },
    () => {
      const used = (progress.gameState.usedWords as string[]) ?? [];
      const lastWord = (progress.gameState.wordData as WordData | undefined)?.word;
      const updatedUsed =
        lastWord && !used.includes(lastWord) ? [...used, lastWord] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      setUsedWords(updatedUsed);
      progress.setRound((r) => r + 1);
      advanceQuestionNum();
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum >= sessionSize ? 1 : savedNum + 1 },
      });
      advanceToNext(updatedUsed);
    }
  );

  const checkAnswer = () => {
    if (answered || !guess.trim()) return;
    setAnswered(true);

    if (guess.trim() === wordData.word) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.scrambleCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { wordData, usedWords, guess, answered: true, feedback: fb, questionNum },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.scrambleWrong", { word: wordData.word }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { wordData, usedWords, guess, answered: true, feedback: fb, questionNum },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/hebrew" />

      <GameShell title={gameTitle("hebrew", "scramble")} emoji="🔤" contentDir="rtl">
        <DifficultySelector
          value={difficulty}
          onChange={changeDifficulty}
          disabled={answered}
        />

        <GameStatus
          current={questionNum}
          total={sessionSize}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="bg-white/90 rounded-2xl p-4 shadow border-2 border-blue-100 mb-3 text-center">
          <p className="text-sm text-blue-500 font-medium mb-1">{t("games.unscramble")}</p>
          <p className="text-4xl font-extrabold text-blue-700 tracking-widest mb-2">
            {wordData.scrambled.split("").join(" ")}
          </p>
          <p className="text-sm text-gray-500">
            {t("games.hint")}: {getWordHint(wordData, locale)} · {t("games.category")}:{" "}
            {getWordCategory(wordData, locale)}
          </p>
        </div>

        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
          disabled={answered}
          placeholder={t("games.writeWord")}
          dir="rtl"
          className="w-full text-xl text-center px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none mb-3 disabled:opacity-50"
        />

        {!answered && (
          <button onClick={checkAnswer} className="game-btn game-btn-primary w-full mb-3">
            {t("common.check")}
          </button>
        )}

        {feedback && (
          <div className="mb-3">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextWord} className="game-btn game-btn-primary w-full">
            {t("games.nextWord")}
          </button>
        )}
      </GameShell>
    </main>
  );
}

export default function ScramblePage() {
  const session = useGameSession("hebrew", "scramble");
  const { ready, content, contentError, difficulty, changeDifficulty, progress } =
    session;

  const words = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "word")
        .map((item) => item.data as unknown as HebrewWord),
    [content]
  );

  if (!ready || words.length === 0) {
    return (
      <GameContentGate loading={!ready || words.length === 0} error={contentError}>
        {null}
      </GameContentGate>
    );
  }

  return (
    <ScramblePlay
      words={words}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
