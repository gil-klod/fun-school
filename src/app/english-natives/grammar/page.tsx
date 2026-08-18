"use client";

import { QuizGame } from "@/components/QuizGame";

export default function GrammarPage() {
  return (
    <QuizGame
      subjectId="english-natives"
      gameId="grammar"
      backHref="/english-natives"
      emoji="📝"
    />
  );
}
