"use client";

import { QuizGame } from "@/components/QuizGame";

export default function VocabularyPage() {
  return (
    <QuizGame
      subjectId="english-natives"
      gameId="vocabulary"
      backHref="/english-natives"
      emoji="🧙"
    />
  );
}
