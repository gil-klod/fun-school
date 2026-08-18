"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { BackButton } from "@/components/BackButton";
import { GameShell } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameContentGate } from "@/components/GameContentGate";
import { useLocale } from "@/i18n/LocaleProvider";

interface SentenceChallenge {
  words: string[];
  correct: string;
  translation: string;
}

interface WordToken {
  id: string;
  word: string;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let state = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildWordBank(challengeIndex: number, words: string[]): WordToken[] {
  return seededShuffle(
    words.map((word, i) => ({ id: `${challengeIndex}-${i}`, word })),
    challengeIndex + 1
  );
}

function tokensFromSavedWords(saved: string[], bank: WordToken[]): WordToken[] {
  const used = new Set<string>();
  const tokens: WordToken[] = [];
  for (const word of saved) {
    const token = bank.find((t) => t.word === word && !used.has(t.id));
    if (token) {
      tokens.push(token);
      used.add(token.id);
    }
  }
  return tokens;
}

function SentencesPlay({
  challenges,
  difficulty,
  changeDifficulty,
  progress,
}: {
  challenges: SentenceChallenge[];
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
}) {
  const { t, gameTitle } = useLocale();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<WordToken[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const challenge = challenges[index % challenges.length];

  const wordBank = useMemo(
    () => buildWordBank(index, challenge.words),
    [index, challenge.words]
  );

  const selectedIds = useMemo(() => new Set(selected.map((t) => t.id)), [selected]);
  const availableWords = useMemo(
    () => wordBank.filter((t) => !selectedIds.has(t.id)),
    [wordBank, selectedIds]
  );

  useEffect(() => {
    setIndex(0);
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
  }, [difficulty, challenges.length]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (s.index !== undefined) {
        const savedIndex = s.index as number;
        setIndex(savedIndex);
        const savedChallenge = challenges[savedIndex % challenges.length];
        const bank = buildWordBank(savedIndex, savedChallenge.words);
        const savedSelected = s.selected;
        if (Array.isArray(savedSelected)) {
          if (savedSelected.length > 0 && typeof savedSelected[0] === "object") {
            setSelected(savedSelected as WordToken[]);
          } else {
            setSelected(tokensFromSavedWords(savedSelected as string[], bank));
          }
        } else {
          setSelected([]);
        }
        setAnswered(!!s.answered);
        if (s.feedback) setFeedback(s.feedback as typeof feedback);
      }
    },
    () => {
      const nextIndex = (progress.gameState.index as number) + 1;
      setIndex(nextIndex);
      setSelected([]);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { index: nextIndex, selected: [], answered: false, feedback: null },
      });
    }
  );

  const nextChallenge = useCallback(() => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
    progress.setRound((r) => r + 1);
    progress.save({
      round: progress.round + 1,
      state: { index: nextIndex, selected: [], answered: false, feedback: null },
    });
  }, [index, progress]);

  const addWord = (token: WordToken) => {
    if (answered) return;
    const next = [...selected, token];
    setSelected(next);
    progress.save({ state: { index, selected: next, answered, feedback } });
  };

  const removeWord = (idx: number) => {
    if (answered) return;
    const next = selected.filter((_, i) => i !== idx);
    setSelected(next);
    progress.save({ state: { index, selected: next, answered, feedback } });
  };

  const checkAnswer = () => {
    if (answered || selected.length !== challenge.words.length) return;
    setAnswered(true);
    const answer = selected.map((t) => t.word).join(" ");

    if (answer === challenge.correct) {
      const pts = 10 + progress.streak;
      progress.setScore((s) => s + pts);
      progress.setStreak((s) => s + 1);
      progress.setCorrect((c) => c + 1);
      const fb = { type: "correct" as const, message: t("games.sentenceCorrect") };
      setFeedback(fb);
      progress.save({
        score: progress.score + pts,
        streak: progress.streak + 1,
        correct: progress.correct + 1,
        state: { index, selected, answered: true, feedback: fb },
      });
    } else {
      progress.setStreak(0);
      progress.setWrong((w) => w + 1);
      const fb = {
        type: "wrong" as const,
        message: t("games.sentenceWrong", {
          answer: challenge.correct,
          translation: challenge.translation,
        }),
      };
      setFeedback(fb);
      progress.save({
        streak: 0,
        wrong: progress.wrong + 1,
        state: { index, selected, answered: true, feedback: fb },
      });
    }
  };

  return (
    <main className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
      <BackButton href="/english-beginners" />

      <GameShell title={gameTitle("english-beginners", "sentences")} emoji="🧩">
        <DifficultySelector
          value={difficulty}
          onChange={changeDifficulty}
          disabled={answered}
        />

        <GameStatus
          current={index + 1}
          total={challenges.length}
          correct={progress.correct}
          wrong={progress.wrong}
          score={progress.score}
        />

        <p className="text-center text-gray-600 mb-4" dir="rtl">
          {challenge.translation}
        </p>

        <div
          className="bg-white/90 rounded-2xl p-4 min-h-[60px] shadow-inner border-2 border-green-200 mb-4 flex flex-wrap gap-2 items-center justify-center"
          onClick={() => {
            if (selected.length > 0 && !answered) removeWord(selected.length - 1);
          }}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400">{t("games.tapWords")}</span>
          ) : (
            selected.map((token, i) => (
              <span
                key={token.id}
                className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-semibold cursor-pointer hover:bg-green-200"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWord(i);
                }}
              >
                {token.word}
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {availableWords.map((token) => (
            <button
              key={token.id}
              onClick={() => addWord(token)}
              disabled={answered}
              className="game-btn-option py-3 px-5"
            >
              {token.word}
            </button>
          ))}
        </div>

        {!answered && (
          <button
            onClick={checkAnswer}
            disabled={selected.length !== challenge.words.length}
            className="game-btn game-btn-primary w-full mb-4 disabled:opacity-40"
          >
            {t("games.checkSentence")}
          </button>
        )}

        {feedback && (
          <div className="mb-4">
            <Feedback type={feedback.type} message={feedback.message} />
          </div>
        )}

        {answered && (
          <button onClick={nextChallenge} className="game-btn game-btn-primary w-full">
            {t("games.nextSentence")}
          </button>
        )}
      </GameShell>
    </main>
  );
}

export default function SentencesPage() {
  const session = useGameSession("english-beginners", "sentences");
  const { ready, content, contentLoading, contentError, difficulty, changeDifficulty, progress } =
    session;

  const challenges = useMemo(
    () =>
      (content?.items ?? [])
        .filter((item) => item.itemType === "sentence")
        .map((item) => item.data as unknown as SentenceChallenge),
    [content]
  );

  if (!ready || challenges.length === 0) {
    return (
      <GameContentGate
        loading={!ready || contentLoading || challenges.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <SentencesPlay
      challenges={challenges}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
    />
  );
}
