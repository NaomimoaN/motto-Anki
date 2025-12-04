export interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: number;

  // SRS (Spaced Repetition System) fields
  interval: number; // Days until next review
  repetition: number; // Number of times successfully recalled
  easeFactor: number; // Difficulty multiplier (starts at 2.5)
  nextReviewDate: number; // Timestamp
  lastDifficulty?: Difficulty; // The last rating given to this card
  isDone?: boolean; // If true, card will not be shown in study sessions
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: Card[];
  createdAt: number;
}

export interface DeletedCard {
  card: Card;
  originDeckId: string;
  originDeckName: string;
  deletedAt: number;
}

export type ViewState =
  | { type: "DASHBOARD" }
  | { type: "DECK_VIEW"; deckId: string }
  | { type: "STUDY_SESSION"; deckId: string }
  | { type: "TRASH" };

export enum Difficulty {
  AGAIN = "Again", // Failed, review immediately
  HARD = "Hard", // Difficult, review soon
  GOOD = "Good", // Normal, standard interval
  EASY = "Easy", // Very easy, long interval
}

export type Theme = "light" | "dark";
