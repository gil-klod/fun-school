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
import { SpeakButton, WordWithSpeaker } from "@/components/EnglishSpeakButton";

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
      challenges={challenges}
      sessionSize={content!.sessionSize}
      difficulty={difficulty}
      changeDifficulty={changeDifficulty}
      progress={progress}
      lockDifficulty={lockDifficulty}
    />
  );
}
