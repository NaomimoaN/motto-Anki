import React, { useState, useEffect } from "react";
import { Card, Difficulty } from "../types";
import { calculateNextReview } from "../services/srsService";

interface Props {
  cards: Card[];
  onComplete: () => void;
  onUpdateCard: (card: Card) => void;
}

export const StudySession: React.FC<Props> = ({
  cards,
  onComplete,
  onUpdateCard,
}) => {
  // Only study cards that are due
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only initialize the queue once on mount.
    // We do NOT want to re-filter when 'cards' prop updates after a rating,
    // because that would remove the current card from the array and shift indices,
    // causing a crash when we increment currentIndex.
    if (hasInitialized) return;

    const now = Date.now();
    const due = cards.filter((c) => c.nextReviewDate <= now && !c.isDone);

    // Shuffle slightly to avoid same order every time
    const shuffled = due.sort(() => Math.random() - 0.5);
    setStudyQueue(shuffled);
    setHasInitialized(true);
  }, [cards, hasInitialized]);

  // If queue is empty (and we have finished initialization), show "All caught up"
  if (hasInitialized && studyQueue.length === 0 && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          All caught up!
        </h2>
        <p className="text-gray-600 mb-8">
          There are no cards due for review in this deck right now.
        </p>
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-[#2B7FFF]/10 text-[#2B7FFF] rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Session Complete!
        </h2>
        <p className="text-gray-600 mb-8">
          You studied {studyQueue.length} cards.
        </p>
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
        >
          Finish
        </button>
      </div>
    );
  }

  // Safety check to prevent crash if render happens before initialization or weird state
  const currentCard = studyQueue[currentIndex];
  if (!currentCard) return null;

  const handleRating = (rating: Difficulty) => {
    // 1. Calculate new stats
    const updates = calculateNextReview(currentCard, rating);
    const updatedCard = { ...currentCard, ...updates };

    // 2. Persist update (this updates parent state, but won't affect our studyQueue due to useEffect dependency fix)
    onUpdateCard(updatedCard);

    // 3. Move to next card
    setIsFlipped(false);

    // Wait for flip animation to reset slightly
    setTimeout(() => {
      if (currentIndex < studyQueue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 200);
  };

  const handleDone = () => {
    // Mark card as done
    const updatedCard = { ...currentCard, isDone: true };
    onUpdateCard(updatedCard);

    // Move to next card
    setIsFlipped(false);

    // Wait for flip animation to reset slightly
    setTimeout(() => {
      if (currentIndex < studyQueue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 200);
  };

  // Helper to show the future interval for a given rating
  const getIntervalLabel = (rating: Difficulty) => {
    const result = calculateNextReview(currentCard, rating);
    const days = result.interval || 0;
    if (days === 0) {
      return "Now";
    }
    return `${days}d`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] transition-all duration-300"
          style={{ width: `${(currentIndex / studyQueue.length) * 100}%` }}
        />
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-800 p-2 -ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-500">
          {currentIndex + 1} / {studyQueue.length}
        </span>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
        <div
          className={`relative w-full max-w-xl aspect-[4/5] md:aspect-[16/9] transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-2xl shadow-xl flex items-center justify-center p-8 backface-hidden border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-800 text-center select-none leading-relaxed">
              {currentCard.front}
            </h2>
            <div className="absolute bottom-6 text-gray-400 text-sm font-medium">
              Tap to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-[#2B7FFF]/5 rounded-2xl shadow-xl flex items-center justify-center p-8 backface-hidden rotate-y-180 border border-[#2B7FFF]/10">
            <div className="text-xl md:text-2xl text-gray-800 text-center leading-relaxed">
              {currentCard.back}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 md:h-32 flex items-center justify-center gap-2 md:gap-4 p-4 bg-white border-t border-gray-200 safe-area-pb">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full max-w-xs bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white py-4 rounded-xl font-bold shadow-md hover:opacity-90 active:transform active:scale-95 transition-all"
          >
            Show Answer
          </button>
        ) : (
          <>
            <button
              onClick={() => handleRating(Difficulty.AGAIN)}
              className="flex-1 max-w-[100px] py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 active:scale-95 transition-all flex flex-col items-center"
            >
              <span>Again</span>
              <span className="text-xs font-normal opacity-70">
                {getIntervalLabel(Difficulty.AGAIN)}
              </span>
            </button>
            <button
              onClick={() => handleRating(Difficulty.HARD)}
              className="flex-1 max-w-[100px] py-3 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 active:scale-95 transition-all flex flex-col items-center"
            >
              <span>Hard</span>
              <span className="text-xs font-normal opacity-70">
                {getIntervalLabel(Difficulty.HARD)}
              </span>
            </button>
            <button
              onClick={() => handleRating(Difficulty.GOOD)}
              className="flex-1 max-w-[100px] py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200 active:scale-95 transition-all flex flex-col items-center"
            >
              <span>Good</span>
              <span className="text-xs font-normal opacity-70">
                {getIntervalLabel(Difficulty.GOOD)}
              </span>
            </button>
            <button
              onClick={() => handleRating(Difficulty.EASY)}
              className="flex-1 max-w-[100px] py-3 rounded-xl bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 active:scale-95 transition-all flex flex-col items-center"
            >
              <span>Easy</span>
              <span className="text-xs font-normal opacity-70">
                {getIntervalLabel(Difficulty.EASY)}
              </span>
            </button>
            <button
              onClick={handleDone}
              className="flex-1 max-w-[100px] py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 active:scale-95 transition-all flex flex-col items-center"
            >
              <span>Done</span>
              <span className="text-xs font-normal opacity-70">Hide</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
