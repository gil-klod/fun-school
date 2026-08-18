"use client";

import { QuizGame } from "@/components/QuizGame";
import { VOCAB_QUESTIONS } from "@/lib/data/english-natives";

export default function VocabularyPage() {
  return (
    <QuizGame
      backHref="/english-natives"
      title="Word Wizard"
      titleHe="קוסם המילים"
      emoji="🧙"
      questions={VOCAB_QUESTIONS}
    />
  );
}
