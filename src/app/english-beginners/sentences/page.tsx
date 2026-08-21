"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { EnglishSpeakButton, SpeakButton, WordWithSpeaker } from "@/components/EnglishSpeakButton";

interface SentenceChallenge {
  words: string[];
  correct: string;
  translation: string;
}

interface WordToken {
  id: string;
  word: string;
}

function challengeKey(challenge: SentenceChallenge): string {
  return challenge.correct;
}

function pickChallenge(
  challenges: SentenceChallenge[],
  usedKeys: string[]
): SentenceChallenge {
  const available = challenges.filter((c) => !usedKeys.includes(challengeKey(c)));
  const pool = available.length > 0 ? available : challenges;
  return pool[Math.floor(Math.random() * pool.length)];
}

function findChallenge(
  challenges: SentenceChallenge[],
  key: string
): SentenceChallenge | undefined {
  return challenges.find((c) => challengeKey(c) === key);
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

function buildWordBank(challenge: SentenceChallenge): WordToken[] {
  return seededShuffle(
    challenge.words.map((word, i) => ({ id: `${challengeKey(challenge)}-${i}`, word })),
    hashString(challenge.correct)
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
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [challenge, setChallenge] = useState<SentenceChallenge>(() => pickChallenge(challenges, []));
  const [selected, setSelected] = useState<WordToken[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const prevDifficultyRef = useRef(difficulty);
  const initializedRef = useRef(false);

  const wordBank = useMemo(() => buildWordBank(challenge), [challenge]);

  const selectedIds = useMemo(() => new Set(selected.map((t) => t.id)), [selected]);
  const availableWords = useMemo(
    () => wordBank.filter((t) => !selectedIds.has(t.id)),
    [wordBank, selectedIds]
  );

  const resetSession = useCallback(() => {
    setUsedKeys([]);
    setChallenge(pickChallenge(challenges, []));
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
    setSessionComplete(false);
    setSlotDone(false);
    resetQuestionNum();
  }, [challenges, resetQuestionNum]);

  const advanceToNext = useCallback(
    (used: string[]) => {
      const next = pickChallenge(challenges, used);
      setUsedKeys(used);
      setChallenge(next);
      setSelected([]);
      setFeedback(null);
      setAnswered(false);
      progress.save({
        state: {
          challengeKey: challengeKey(next),
          usedKeys: used,
          selected: [],
          answered: false,
          feedback: null,
          questionNum,
        },
      });
    },
    [challenges, progress, questionNum]
  );

  useEffect(() => {
    if (!progress.loaded) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!progress.hasSavedProgress) {
        resetSession();
      }
      return;
    }

    if (prevDifficultyRef.current !== difficulty) {
      prevDifficultyRef.current = difficulty;
      resetSession();
    }
  }, [progress.loaded, progress.hasSavedProgress, difficulty, resetSession]);

  useGameResume(
    progress.loaded,
    progress.hasSavedProgress,
    progress.gameState,
    (s) => {
      const used = (s.usedKeys as string[]) ?? [];
      setUsedKeys(used);

      if (typeof s.questionNum === "number") {
        setQuestionNum(s.questionNum);
      }

      const savedKey = typeof s.challengeKey === "string" ? s.challengeKey : null;
      const restored = savedKey ? findChallenge(challenges, savedKey) : undefined;

      if (restored) {
        setChallenge(restored);
        const bank = buildWordBank(restored);
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
        return;
      }

      const first = pickChallenge(challenges, []);
      setUsedKeys([]);
      setChallenge(first);
      setSelected([]);
      setAnswered(false);
      setFeedback(null);
      setQuestionNum(1);
      progress.save({
        state: {
          questionNum: 1,
          challengeKey: challengeKey(first),
          usedKeys: [],
          selected: [],
          answered: false,
          feedback: null,
        },
      });
    },
    () => {
      const used = (progress.gameState.usedKeys as string[]) ?? [];
      const lastKey = progress.gameState.challengeKey as string | undefined;
      const updatedUsed =
        lastKey && !used.includes(lastKey) ? [...used, lastKey] : used;
      const savedNum = (progress.gameState.questionNum as number) ?? questionNum;
      if (savedNum >= sessionSize) {
        progress.markCompleted();
        if (project.isProjectGame) setSlotDone(true);
        else setSessionComplete(true);
        return;
      }
      setUsedKeys(updatedUsed);
      advanceQuestionNum();
      setSelected([]);
      setFeedback(null);
      setAnswered(false);
      progress.setRound((r) => r + 1);
      progress.save({
        round: progress.round + 1,
        state: { questionNum: savedNum + 1 },
      });
      advanceToNext(updatedUsed);
    }
  );

  const nextChallenge = useCallback(() => {
    const result = project.handleSessionNext(
      questionNum,
      sessionSize,
      progress.markCompleted,
      () => {
        const key = challengeKey(challenge);
        const used = usedKeys.includes(key) ? usedKeys : [...usedKeys, key];
        const nextNum = questionNum + 1;
        setUsedKeys(used);
        advanceQuestionNum();
        progress.setRound((r) => r + 1);
        progress.save({
          round: progress.round + 1,
          state: { questionNum: nextNum },
        });
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
    challenge,
    usedKeys,
    advanceQuestionNum,
    advanceToNext,
  ]);

  const playAgain = useCallback(() => {
    const first = pickChallenge(challenges, []);
    setSessionComplete(false);
    resetQuestionNum();
    setUsedKeys([]);
    setChallenge(first);
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
      state: {
        questionNum: 1,
        challengeKey: challengeKey(first),
        usedKeys: [],
        selected: [],
        answered: false,
        feedback: null,
      },
    });
  }, [progress, challenges, resetQuestionNum]);

  const addWord = (token: WordToken) => {
    if (answered) return;
    const next = [...selected, token];
    setSelected(next);
    progress.save({
      state: {
        questionNum,
        challengeKey: challengeKey(challenge),
        usedKeys,
        selected: next,
        answered,
        feedback,
      },
    });
  };

  const removeWord = (idx: number) => {
    if (answered) return;
    const next = selected.filter((_, i) => i !== idx);
    setSelected(next);
    progress.save({
      state: {
        questionNum,
        challengeKey: challengeKey(challenge),
        usedKeys,
        selected: next,
        answered,
        feedback,
      },
    });
  };

  const checkAnswer = () => {
    if (answered || selected.length !== challenge.words.length) return;
    setAnswered(true);
    const answer = selected.map((t) => t.word).join(" ");

    if (answer === challenge.correct) {
      const fb = { type: "correct" as const, message: t("games.sentenceCorrect") };
      setFeedback(fb);
      void progress.recordAnswerAndSave(true, {
        questionNum,
        challengeKey: challengeKey(challenge),
        usedKeys,
        selected,
        answered: true,
        feedback: fb,
      });
    } else {
      const fb = {
        type: "wrong" as const,
        message: t("games.sentenceWrong", {
          answer: challenge.correct,
          translation: challenge.translation,
        }),
      };
      setFeedback(fb);
      void progress.recordAnswerAndSave(false, {
        questionNum,
        challengeKey: challengeKey(challenge),
        usedKeys,
        selected,
        answered: true,
        feedback: fb,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex flex-col items-center gap-2 mb-4" dir="rtl">
                <p className="text-center text-gray-600">{challenge.translation}</p>
                <SpeakButton text={challenge.translation} locale="he" />
              </div>

              <div
                dir="ltr"
                className="bg-white/90 rounded-2xl p-4 min-h-[60px] shadow-inner border-2 border-green-200 flex flex-wrap gap-2 items-center justify-start text-left"
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
                      dir="ltr"
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

              {answered && (
                <div
                  dir="ltr"
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
                >
                  <p className="text-lg font-bold text-green-800">{challenge.correct}</p>
                  <EnglishSpeakButton text={challenge.correct} />
                </div>
              )}
            </div>

            <div dir="ltr">
              <div className="flex flex-wrap gap-3 justify-start mb-4">
                {availableWords.map((token) => (
                  <WordWithSpeaker
                    key={token.id}
                    word={token.word}
                    speakLocale="en"
                    disabled={answered}
                    onWordClick={() => addWord(token)}
                    wordClassName="game-btn-option py-3 px-5"
                  />
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
                <div dir="ltr">
                  <Feedback type={feedback.type} message={feedback.message} />
                </div>
              )}

              {answered && (
                <button onClick={nextChallenge} className="game-btn game-btn-primary w-full mt-4">
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
      key={`${difficulty}-${challenges.length}`}
      challenges={challenges}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
