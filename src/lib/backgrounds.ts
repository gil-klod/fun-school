export const PAGE_BACKGROUNDS = [
  { id: "classroom-sky", src: "/backgrounds/classroom-sky.svg", label: "Classroom sky" },
  { id: "chalkboard", src: "/backgrounds/chalkboard.svg", label: "Chalkboard" },
  { id: "notebook-paper", src: "/backgrounds/notebook-paper.svg", label: "Notebook paper" },
  { id: "rainbow-dots", src: "/backgrounds/rainbow-dots.svg", label: "Rainbow dots" },
  { id: "library-books", src: "/backgrounds/library-books.svg", label: "Library books" },
  { id: "space-stars", src: "/backgrounds/space-stars.svg", label: "Space stars" },
] as const;

export type PageBackgroundId = (typeof PAGE_BACKGROUNDS)[number]["id"];

export const PAGE_BACKGROUND_IDS = PAGE_BACKGROUNDS.map((bg) => bg.id);

export function getBackgroundById(id: PageBackgroundId) {
  return PAGE_BACKGROUNDS.find((bg) => bg.id === id) ?? PAGE_BACKGROUNDS[0];
}

export function pickRandomBackgroundId(): PageBackgroundId {
  const index = Math.floor(Math.random() * PAGE_BACKGROUNDS.length);
  return PAGE_BACKGROUNDS[index].id;
}
