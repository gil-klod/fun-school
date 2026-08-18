"use client";

interface FeedbackProps {
  type: "correct" | "wrong" | "info";
  message: string;
  explanation?: string;
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

export function Feedback({ type, message, explanation }: FeedbackProps) {
  return (
    <div
      className={`animate-bounce-in rounded-2xl border-2 px-6 py-4 text-center ${styles[type]}`}
    >
      <p className="text-xl font-bold">
        {emojis[type]} {message}
      </p>
      {explanation && <p className="mt-2 text-sm opacity-80">{explanation}</p>}
    </div>
  );
}
