"use client";

import { QuizGame } from "@/components/QuizGame";
import { VOCAB_QUESTIONS } from "@/lib/data/english-natives";

export default function VocabularyPage() {
  return (
    <QuizGame
      subjectId="english-natives"
      gameId="vocabulary"
      backHref="/english-natives"
      emoji="🧙"
      questions={VOCAB_QUESTIONS}
    />
  );
}
