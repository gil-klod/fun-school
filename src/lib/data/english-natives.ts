import type { QuizQuestion } from "../types";

export const GRAMMAR_QUESTIONS: QuizQuestion[] = [
  {
    question: "Yesterday I ___ to the park.",
    options: ["go", "went", "going", "goes"],
    correctIndex: 1,
    explanation: "Yesterday = past tense → went",
  },
  {
    question: "She ___ playing football right now.",
    options: ["is", "are", "am", "be"],
    correctIndex: 0,
    explanation: "She + is for present continuous",
  },
  {
    question: "There are three ___.",
    options: ["child", "childs", "children", "childrens"],
    correctIndex: 2,
    explanation: "Child → children (irregular plural)",
  },
  {
    question: "He ___ his homework every day.",
    options: ["do", "does", "doing", "did"],
    correctIndex: 1,
    explanation: "He/She/It + does in present simple",
  },
  {
    question: "I have ___ apple.",
    options: ["a", "an", "the", "some"],
    correctIndex: 1,
    explanation: "Apple starts with a vowel sound → an",
  },
  {
    question: "They ___ at home last night.",
    options: ["was", "were", "is", "are"],
    correctIndex: 1,
    explanation: "They + were (past tense of are)",
  },
  {
    question: "The cat is ___ the table.",
    options: ["in", "on", "at", "by"],
    correctIndex: 1,
    explanation: "On = on top of the table",
  },
  {
    question: "My brother is ___ than me.",
    options: ["tall", "taller", "tallest", "more tall"],
    correctIndex: 1,
    explanation: "Comparing two people → taller",
  },
];

export const VOCAB_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the opposite of 'hot'?",
    options: ["warm", "cold", "cool", "freezing"],
    correctIndex: 1,
    explanation: "Hot ↔ Cold",
  },
  {
    question: "Which word means the same as 'big'?",
    options: ["small", "tiny", "large", "short"],
    correctIndex: 2,
    explanation: "Big = Large",
  },
  {
    question: "What does 'brave' mean?",
    options: ["Scared", "Not afraid", "Tired", "Hungry"],
    correctIndex: 1,
    explanation: "Brave = not afraid, courageous",
  },
  {
    question: "What is the opposite of 'begin'?",
    options: ["start", "end", "continue", "open"],
    correctIndex: 1,
    explanation: "Begin ↔ End",
  },
  {
    question: "Which word means 'very tired'?",
    options: ["exhausted", "excited", "enormous", "elegant"],
    correctIndex: 0,
    explanation: "Exhausted = very tired",
  },
  {
    question: "What does 'whisper' mean?",
    options: ["Shout loudly", "Speak very quietly", "Sing", "Laugh"],
    correctIndex: 1,
    explanation: "Whisper = speak very quietly",
  },
  {
    question: "Which word means the same as 'quick'?",
    options: ["slow", "fast", "heavy", "late"],
    correctIndex: 1,
    explanation: "Quick = Fast",
  },
  {
    question: "What is the opposite of 'generous'?",
    options: ["kind", "selfish", "happy", "polite"],
    correctIndex: 1,
    explanation: "Generous ↔ Selfish",
  },
];

export interface EnglishStory {
  title: string;
  text: string;
  questions: QuizQuestion[];
}

export const ENGLISH_STORIES: EnglishStory[] = [
  {
    title: "The Lost Key",
    text: "Tom was getting ready for school when he couldn't find his house key. He looked in his backpack, under his bed, and even in the kitchen. His little sister Lily said, 'Maybe you left it in the garden yesterday.' Tom ran outside and found the key under a flower pot. He was just in time for the bus!",
    questions: [
      {
        question: "What was Tom looking for?",
        options: ["His phone", "His house key", "His homework", "His shoes"],
        correctIndex: 1,
      },
      {
        question: "Who gave Tom a hint?",
        options: ["His mom", "His dad", "Lily", "His teacher"],
        correctIndex: 2,
      },
      {
        question: "Where did Tom find the key?",
        options: ["In his backpack", "Under a flower pot", "In the kitchen", "On the bus"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Science Fair",
    text: "Noa spent two weeks building a volcano for the school science fair. She mixed baking soda and vinegar to make it erupt. On the day of the fair, hundreds of students came to watch. Noa's volcano was the loudest and most exciting one. She won first prize and a big blue ribbon!",
    questions: [
      {
        question: "What did Noa build?",
        options: ["A robot", "A volcano", "A bridge", "A rocket"],
        correctIndex: 1,
      },
      {
        question: "How long did she work on it?",
        options: ["One day", "One week", "Two weeks", "One month"],
        correctIndex: 2,
      },
      {
        question: "What prize did Noa win?",
        options: ["Second prize", "Third prize", "First prize", "No prize"],
        correctIndex: 2,
      },
    ],
  },
];

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
