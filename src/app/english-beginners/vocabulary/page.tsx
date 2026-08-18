"use client";

import { useState, useCallback } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameProgressBar } from "@/components/GameProgressBar";
import { Feedback } from "@/components/Feedback";
import { ResumeNotice } from "@/components/ResumeNotice";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useLocale } from "@/i18n/LocaleProvider";
import { BEGINNER_VOCAB, shuffleArray } from "@/lib/data/english-beginners";
import type { Locale } from "@/i18n/types";

type VocabQuestion = {
  prompt: string;
  correct: string;
  options: string[];
  emoji: string;
  englishWord: string;
};

function generateQuestion(
  usedWords: string[],
  _locale: Locale,
  t: (key: string, params?: Record<string, string>) => string
): VocabQuestion {
  const available = BEGINNER_VOCAB.filter((v) => !usedWords.includes(v.english));
  const pool = available.length > 0 ? available : BEGINNER_VOCAB;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffleArray(BEGINNER_VOCAB.filter((v) => v.english !== correct.english)).slice(0, 3);
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

export default function VocabularyPage() {
  const { t, gameTitle, locale } = useLocale();
  const progress = useGameProgress({ subjectId: "english-beginners", gameId: "vocabulary" });
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [question, setQuestion] = useState<VocabQuestion>(() =>
    generateQuestion([], locale, t)
  );
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const advanceToNext = useCallback(
    (currentUsed: string[]) => {
      const q = generateQuestion(currentUsed, locale, t);
      setQuestion(q);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: { question: q, usedWords: currentUsed, answered: false, feedback: null },
      });
    },
    [progress, locale, t]
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

        <GameProgressBar
          score={progress.score}
          streak={progress.streak}
          round={progress.round}
          correct={progress.correct}
          wrong={progress.wrong}
        />

        <div className="bg-white/90 rounded-3xl p-8 shadow-lg border-2 border-green-100 mb-6 text-center">
          <span className="text-5xl">{question.emoji}</span>
          <p className="text-xl font-bold text-gray-800 mt-4">{question.prompt}</p>
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
