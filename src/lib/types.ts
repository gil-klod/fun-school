export type SubjectId = "math" | "hebrew" | "english-beginners" | "english-natives";

export interface GameInfo {
  id: string;
  title: string;
  titleHe?: string;
  description: string;
  emoji: string;
  href: string;
}

export interface SubjectInfo {
  id: SubjectId;
  title: string;
  titleHe: string;
  emoji: string;
  color: string;
  borderColor: string;
  href: string;
  games: GameInfo[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
