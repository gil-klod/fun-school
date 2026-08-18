export type Locale = "he" | "en";

export const DEFAULT_LOCALE: Locale = "he";
export const LOCALE_STORAGE_KEY = "fun-school-locale";

export interface GameStrings {
  title: string;
  description: string;
}

export interface SubjectStrings {
  title: string;
  games: Record<string, GameStrings>;
}

export interface Dictionary {
  common: {
    loading: string;
    back: string;
    home: string;
    next: string;
    check: string;
    playAgain: string;
    seeResults: string;
    nextQuestion: string;
    score: string;
    streak: string;
    round: string;
    games: string;
    gotIt: string;
    continue: string;
    refresh: string;
    updating: string;
  };
  nav: {
    myProgress: string;
    hi: string;
    logOut: string;
  };
  home: {
    tagline: string;
    subtitle: string;
    footer: string;
    continueTitle: string;
    continueRound: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    name: string;
    passwordHint: string;
    login: string;
    loggingIn: string;
    signUp: string;
    creatingAccount: string;
    noAccount: string;
    hasAccount: string;
    verifySuccess: string;
    verifyFailed: string;
    verifying: string;
    redirecting: string;
    tryAgain: string;
    invalidCredentials: string;
    emailVerifiedBanner: string;
    checkEmail: string;
    goToLogin: string;
    devVerifyLink: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    empty: string;
    startPlaying: string;
    coachTitle: string;
    refreshAnalysis: string;
    strengths: string;
    toImprove: string;
    tips: string;
    subjectBreakdown: string;
    gameDetails: string;
    keepPlayingStrengths: string;
    lookingGood: string;
    game: string;
    accuracy: string;
    answers: string;
    noStrengths: string;
  };
  subjects: Record<string, SubjectStrings>;
  games: {
    correct: string;
    wrongAnswer: string;
    allDone: string;
    storyComplete: string;
    readAnother: string;
    needHint: string;
    resumed: string;
    mixed: string;
    howMuchChange: string;
    shoppingList: string;
    total: string;
    youPay: string;
    whichWordWrong: string;
    findMistake: string;
    correctSentence: string;
    unscramble: string;
    writeWord: string;
    tapWords: string;
    checkSentence: string;
    whichIsWrong: string;
    nextShopping: string;
    nextMystery: string;
    nextWord: string;
    nextSentence: string;
    multiplicationCorrect: string;
    multiplicationWrong: string;
    shukCorrect: string;
    shukWrong: string;
    mysteryCorrect: string;
    mysteryWrong: string;
    scrambleCorrect: string;
    scrambleWrong: string;
    fixCorrect: string;
    fixWrong: string;
    vocabCorrect: string;
    vocabWrong: string;
    sentenceCorrect: string;
    sentenceWrong: string;
    colorsCorrect: string;
    colorsWrong: string;
    storyCorrect: string;
    storyWrong: string;
  };
}
