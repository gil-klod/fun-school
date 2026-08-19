"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage, GameOptionsGrid } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";
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
  difficulty,
  changeDifficulty,
  progress,
}: {
  vocab: VocabPair[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle, locale } = useLocale();
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [question, setQuestion] = useState<VocabQuestion>(() =>
    generateQuestion(vocab, [], locale, t)
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setUsedWords([]);
    setQuestion(generateQuestion(vocab, [], locale, t));
    setFeedback(null);
    setAnswered(false);
  }, [difficulty, vocab, locale, t]);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const q = generateQuestion(vocab, currentUsed, locale, t);
      setQuestion(q);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: { question: q, usedWords: currentUsed, answered: false, feedback: null },
      });
    },
    [progress, vocab, locale, t]
  );

  const nextQuestion = useCallback(() => {
    const used = usedWords.includes(question.englishWord)
      ? usedWords
      : [...usedWords, question.englishWord];
    setUsedWords(used);
    progress.setRound((r) => r + 1);
    progress.save({ round: progress.round + 1 });
    advanceToNext(used);
  }, [usedWords, question.englishWord, progress, advanceToNext]);

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
      }
    },
    () => {
      const used = (progress.gameState.usedWords as string[]) ?? [];
      const lastWord = (progress.gameState.question as VocabQuestion | undefined)?.englishWord;
      const updatedUsed =
        lastWord && !used.includes(lastWord) ? [...used, lastWord] : used;
      setUsedWords(updatedUsed);
      progress.setRound((r) => r + 1);
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
        state: { question, usedWords, answered: true, feedback: fb },
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
        state: { question, usedWords, answered: true, feedback: fb },
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
        difficultyDisabled={answered}
      >
        <GameStatus
          current={((progress.round - 1) % vocab.length) + 1}
          total={vocab.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-center">
          <div className="bg-white/90 rounded-2xl p-5 sm:p-8 shadow border-2 border-green-100 text-center">
            <span className="text-5xl sm:text-6xl">{question.emoji}</span>
            <p className="text-xl font-bold text-gray-800 mt-4">{question.prompt}</p>
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
            {t("games.nextWord")}
          </button>
        )}
      </GameShell>
    </GamePage>
  );
}

export default function VocabularyPage() {
  const session = useGameSession("english-beginners", "vocabulary");
  const { ready, content, contentError, difficulty, changeDifficulty, progress } =
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
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
