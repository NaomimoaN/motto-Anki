import { Card, Difficulty } from "../types";

// A simplified implementation of the SM-2 algorithm used by Anki
export const calculateNextReview = (
  card: Card,
  rating: Difficulty
): Partial<Card> => {
  let interval = card.interval;
  let repetition = card.repetition;
  let easeFactor = card.easeFactor;

  if (rating === Difficulty.AGAIN) {
    repetition = 0;
    interval = 0; // Show again in current session
  } else {
    if (rating === Difficulty.HARD) {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = 1; // 1 day
    } else if (rating === Difficulty.GOOD) {
      interval = 5; // 5 days
    } else if (rating === Difficulty.EASY) {
      easeFactor += 0.15;
      interval = 14; // 14 days
    }

    repetition += 1;
  }

  // Round interval to nearest whole day, minimum 0
  interval = Math.max(0, Math.round(interval));

  // Calculate next date
  const now = new Date();
  const nextReviewDate = now.setDate(now.getDate() + interval);

  return {
    interval,
    repetition,
    easeFactor,
    nextReviewDate,
    lastDifficulty: rating,
  };
};

export const createNewCard = (front: string, back: string): Card => {
  return {
    id: crypto.randomUUID(),
    front,
    back,
    createdAt: Date.now(),
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now(), // Due immediately
  };
};
