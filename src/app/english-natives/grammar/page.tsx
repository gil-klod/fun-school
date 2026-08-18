"use client";

import { QuizGame } from "@/components/QuizGame";
import { GRAMMAR_QUESTIONS } from "@/lib/data/english-natives";

export default function GrammarPage() {
  return (
    <QuizGame
      subjectId="english-natives"
      gameId="grammar"
      backHref="/english-natives"
      title="Grammar Quest"
      titleHe="משימת דקדוק"
      emoji="📝"
      questions={GRAMMAR_QUESTIONS}
    />
  );
}
