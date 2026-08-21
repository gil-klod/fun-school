"use client";

import { useState } from "react";
import Link from "next/link";
import { GameOptionsGrid } from "@/components/GameShell";
import { Feedback } from "@/components/Feedback";
import { useLocale } from "@/i18n/LocaleProvider";
import { HOME_DEMO_QUESTIONS } from "@/lib/demoQuestions";

export function HomeDemo() {
  const { t, locale, gameTitle, subjectTitle } = useLocale();
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; message: string } | null>(
    null
  );

  const finished = step >= HOME_DEMO_QUESTIONS.length;

  const handleAnswer = (option: string) => {
    if (answered || finished) return;
    const question = HOME_DEMO_QUESTIONS[step];
    setAnswered(true);
    if (option === question.answer) {
      setFeedback({ type: "correct", message: t("home.demoCorrect") });
    } else {
      setFeedback({
        type: "wrong",
        message: t("home.demoWrong", { answer: question.answer }),
      });
    }
  };

  const goNext = () => {
    if (step + 1 >= HOME_DEMO_QUESTIONS.length) {
      setStep(HOME_DEMO_QUESTIONS.length);
      setAnswered(false);
      setFeedback(null);
      return;
    }
    setStep((s) => s + 1);
    setAnswered(false);
    setFeedback(null);
  };

  const restartDemo = () => {
    setStep(0);
    setAnswered(false);
    setFeedback(null);
  };

  const doneScreen = (
    <div className="text-center py-4">
      <p className="text-4xl mb-3">🌟</p>
      <p className="text-lg font-bold text-gray-800 mb-2">{t("home.demoAllDone")}</p>
      <p className="text-sm text-gray-500 mb-4">{t("home.demoAllDoneHint")}</p>
      <button
        type="button"
        onClick={restartDemo}
        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline"
      >
        {t("home.demoRestart")}
      </button>
    </div>
  );

  if (finished) {
    return (
      <section className="mb-8 sm:mb-10">
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-md overflow-hidden">
          <div className="bg-amber-100/80 border-b border-amber-200 px-4 py-3 text-center">
            <p className="text-sm sm:text-base font-bold text-amber-900">
              🎮 {t("home.demoNotice")}
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-1">
              {t("home.demoTitle")}
            </h2>
            {doneScreen}
          </div>
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[16rem] px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg sm:text-xl font-extrabold shadow-lg hover:shadow-xl transition-all animate-pop"
          >
            {t("home.demoRegister")} 🎒
          </Link>
          <p className="text-sm text-gray-500 mt-3">{t("home.demoRegisterHint")}</p>
        </div>
      </section>
    );
  }

  const question = HOME_DEMO_QUESTIONS[step];
  const prompt = locale === "he" ? question.promptHe : question.promptEn;

  return (
    <section className="mb-8 sm:mb-10">
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-md overflow-hidden">
        <div className="bg-amber-100/80 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-sm sm:text-base font-bold text-amber-900">
            🎮 {t("home.demoNotice")}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-1">
            {t("home.demoTitle")}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-5">{t("home.demoSubtitle")}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
              {subjectTitle(question.subjectId)} · {gameTitle(question.subjectId, question.gameId)}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {t("home.demoProgress", {
                current: String(step + 1),
                total: String(HOME_DEMO_QUESTIONS.length),
              })}
            </span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-indigo-100 p-5 sm:p-8 text-center mb-4">
            <span
              className="block text-5xl sm:text-6xl mb-3 leading-none"
              dir={question.displayDir ?? "ltr"}
            >
              {question.display}
            </span>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{prompt}</p>
          </div>

          <GameOptionsGrid>
            {question.options.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(opt)}
                dir={question.optionsDir ?? "ltr"}
                className={`game-btn-option text-lg py-4 ${answered && opt === question.answer ? "correct" : ""} ${answered && opt !== question.answer ? "opacity-50" : ""}`}
              >
                {opt}
              </button>
            ))}
          </GameOptionsGrid>

          {feedback && (
            <div className="mt-4">
              <Feedback type={feedback.type} message={feedback.message} mascot={false} />
            </div>
          )}

          {answered && (
            <button
              type="button"
              onClick={goNext}
              className="game-btn game-btn-primary w-full sm:max-w-md mx-auto block mt-4"
            >
              {step + 1 >= HOME_DEMO_QUESTIONS.length
                ? t("home.demoFinish")
                : t("home.demoNext")}
            </button>
          )}

          <div className="flex justify-center gap-2 mt-5">
            {HOME_DEMO_QUESTIONS.map((q, i) => (
              <span
                key={q.id}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i < step ? "bg-green-500" : i === step ? "bg-indigo-500" : "bg-gray-300"
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[16rem] px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg sm:text-xl font-extrabold shadow-lg hover:shadow-xl transition-all animate-pop"
        >
          {t("home.demoRegister")} 🎒
        </Link>
        <p className="text-sm text-gray-500 mt-3">{t("home.demoRegisterHint")}</p>
      </div>
    </section>
  );
}
