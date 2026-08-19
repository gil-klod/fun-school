"use client";

import { useEffect, useRef } from "react";
import { useMascot } from "@/components/mascot";

interface FeedbackProps {
  type: "correct" | "wrong" | "info";
  message: string;
  explanation?: string;
  /** Trigger Milo mascot reaction. Default true for correct/wrong. */
  mascot?: boolean;
}

const styles = {
  correct: "bg-green-100 border-green-400 text-green-800",
  wrong: "bg-red-100 border-red-400 text-red-800",
  info: "bg-blue-100 border-blue-400 text-blue-800",
};

const emojis = {
  correct: "🎉",
  wrong: "💪",
  info: "💡",
};

export function Feedback({ type, message, explanation, mascot = true }: FeedbackProps) {
  const { celebrate, encourage } = useMascot();
  const lastReaction = useRef("");

  useEffect(() => {
    if (!mascot || type === "info") return;
    const key = `${type}:${message}`;
    if (lastReaction.current === key) return;
    lastReaction.current = key;

    if (type === "correct") celebrate();
    else if (type === "wrong") encourage();
  }, [type, message, mascot, celebrate, encourage]);

  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${styles[type]}`}>
      <p className="text-base font-bold">
        {emojis[type]} {message}
      </p>
      {explanation && <p className="mt-1 text-sm opacity-80">{explanation}</p>}
    </div>
  );
}
