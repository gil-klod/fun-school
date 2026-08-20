"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useGameResume } from "@/hooks/useGameResume";
import { useGameSession } from "@/hooks/useGameSession";
import { GameShell, GamePage } from "@/components/GameShell";
import { GameStatus } from "@/components/GameStatus";
import { Feedback } from "@/components/Feedback";
import { GameContentGate } from "@/components/GameContentGate";
import { useQuestionCounter } from "@/hooks/useQuestionCounter";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProjectGame } from "@/hooks/useProjectGame";
import { ProjectSlotDone } from "@/components/projects/ProjectSlotDone";
import { SessionComplete } from "@/components/SessionComplete";

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
  sessionSize,
  difficulty,
  changeDifficulty,
  progress,
  lockDifficulty,
}: {
  challenges: SentenceChallenge[];
  sessionSize: number;
  difficulty: ReturnType<typeof useGameSession>["difficulty"];
  changeDifficulty: ReturnType<typeof useGameSession>["changeDifficulty"];
  progress: ReturnType<typeof useGameSession>["progress"];
  lockDifficulty?: boolean;
}) {
  const { t, gameTitle } = useLocale();
  const project = useProjectGame();
  const [slotDone, setSlotDone] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { current: questionNum, setCurrent: setQuestionNum, reset: resetQuestionNum, advance: advanceQuestionNum } =
    useQuestionCounter(sessionSize);
  const [selected, setSelected] = useState<WordToken[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);

  const challengeIndex = (questionNum - 1) % challenges.length;
  const challenge = challenges[challengeIndex];

  const wordBank = useMemo(
    () => buildWordBank(challengeIndex, challenge.words),
    [challengeIndex, challenge.words]
  );

  const selectedIds = useMemo(() => new Set(selected.map((t) => t.id)), [selected]);
  const availableWords = useMemo(
    () => wordBank.filter((t) => !selectedIds.has(t.id)),
    [wordBank, selectedIds]
  );

  useEffect(() => {
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [difficulty, challenges.length, resetQuestionNum]);

  useEffect(() => {
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
  }, [questionNum]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      if (typeof s.questionNum === "number") {
        const savedNum = s.questionNum as number;
        setQuestionNum(savedNum);
        const savedChallenge = challenges[(savedNum - 1) % challenges.length];
        const bank = buildWordBank((savedNum - 1) % challenges.length, savedChallenge.words);
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
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      advanceQuestionNum();
      setSelected([]);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum + 1, selected: [], answered: false, feedback: null },
      });
    }
  );

  const nextChallenge = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const nextNum = questionNum + 1;
        advanceQuestionNum();
        setSelected([]);
        setFeedback(null);
        setAnswered(false);
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { questionNum: nextNum, selected: [], answered: false, feedback: null },
        });
      }
    );
    if (result === "project") setSlotDone(true);
    if (result === "complete") setSessionComplete(true);
  }, [project, questionNum, sessionSize, progress, advanceQuestionNum]);

  const playAgain = useCallback(() => {
    setSessionComplete(false);
    resetQuestionNum();
    setSelected([]);
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
      state: { questionNum: 1, selected: [], answered: false, feedback: null },
    });
  }, [progress, resetQuestionNum]);

  const addWord = (token: WordToken) => {
    if (answered) return;
    const next = [...selected, token];
    setSelected(next);
    progress.save({ state: { questionNum, selected: next, answered, feedback } });
  };

  const removeWord = (idx: number) => {
    if (answered) return;
    const next = selected.filter((_, i) => i !== idx);
    setSelected(next);
    progress.save({ state: { questionNum, selected: next, answered, feedback } });
  };

  const clearSentence = () => {
    if (answered) return;
    setSelected([]);
    progress.save({ state: { questionNum, selected: [], answered, feedback } });
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
        state: { questionNum, selected, answered: true, feedback: fb },
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
        state: { questionNum, selected, answered: true, feedback: fb },
      });
    }
  };

  return (
    <GamePage>
      <GameShell
        title={gameTitle("english-beginners", "sentences")}
        emoji="🧩"
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
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="rounded-2xl border-2 border-indigo-100 bg-white/95 p-5 shadow-sm">
              <p className="text-center text-xl font-bold text-gray-800 leading-relaxed" dir="rtl">
                {challenge.translation}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-green-200 bg-white/95 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-600" dir="ltr">
                  {t("games.sentenceBuildHint")}
                </p>
                <span className="text-xs font-medium text-gray-500" dir="ltr">
                  {t("games.sentenceWordCount", {
                    current: String(selected.length),
                    total: String(challenge.words.length),
                  })}
                </span>
              </div>

              <div
                dir="ltr"
                className="min-h-[4.5rem] rounded-xl border-2 border-dashed border-green-300 bg-green-50/60 p-3 flex flex-wrap gap-2 items-center justify-start text-left"
                onClick={() => {
                  if (selected.length > 0 && !answered) removeWord(selected.length - 1);
                }}
              >
                {selected.length === 0 ? (
                  <span className="text-sm text-gray-400">{t("games.tapWords")}</span>
                ) : (
                  selected.map((token, i) => (
                    <span
                      key={token.id}
                      dir="ltr"
                      className="bg-white text-green-800 border border-green-300 px-3 py-2 rounded-lg font-semibold cursor-pointer hover:bg-green-100 shadow-sm"
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

              {!answered && selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearSentence}
                  className="mt-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  dir="ltr"
                >
                  {t("games.sentenceClear")}
                </button>
              )}
            </div>

            <div className="rounded-2xl border-2 border-indigo-100 bg-white/95 p-4 shadow-sm" dir="ltr">
              <p className="mb-3 text-sm font-semibold text-gray-600">{t("games.sentenceWordBank")}</p>
              <div className="flex flex-wrap gap-2 justify-start">
                {availableWords.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => addWord(token)}
                    disabled={answered}
                    className="game-btn-option py-2.5 px-4 text-base disabled:opacity-40"
                  >
                    {token.word}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3" dir="ltr">
              {!answered && (
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={selected.length !== challenge.words.length}
                  className="game-btn game-btn-primary w-full disabled:opacity-40"
                >
                  {t("games.checkSentence")}
                </button>
              )}

              {feedback && <Feedback type={feedback.type} message={feedback.message} />}

              {answered && (
                <button type="button" onClick={nextChallenge} className="game-btn game-btn-primary w-full">
                  {questionNum >= sessionSize ? t("common.seeResults") : t("games.nextSentence")}
                </button>
              )}
            </div>
          </div>
        ) : slotDone ? (
          <ProjectSlotDone />
        ) : (
          <SessionComplete score={progress.score} onPlayAgain={playAgain} />
        )}
      </GameShell>
    </GamePage>
  );
}

export default function SentencesPage() {
  const session = useGameSession("english-beginners", "sentences");
  const { ready, content, contentError, difficulty, changeDifficulty, progress, lockDifficulty } =
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
        loading={!ready || challenges.length === 0}
        error={contentError}
      >
        {null}
      </GameContentGate>
    );
  }

  return (
    <SentencesPlay
      challenges={challenges}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
