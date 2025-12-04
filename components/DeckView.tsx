import React, { useState } from "react";
import { Deck, Card, DeletedCard, Theme } from "../types";
import {
  generateCardsFromTopic,
  generateCardsFromText,
  generateQuizFromWords,
} from "../services/geminiService";
import { createNewCard } from "../services/srsService";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  deck: Deck;
  trash: DeletedCard[];
  onBack: () => void;
  onStartStudy: () => void;
  onAddCard: (card: Card) => void;
  onAddMultipleCards: (cards: Card[]) => void;
  onEditDeck: (name: string, description: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onRestoreCard: (card: DeletedCard) => void;
  onDeleteForever: (card: DeletedCard) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

type Tab = "list" | "add" | "ai" | "quiz" | "trash";

export const DeckView: React.FC<Props> = ({
  deck,
  trash,
  onBack,
  onStartStudy,
  onAddCard,
  onAddMultipleCards,
  onEditDeck,
  onEditCard,
  onDeleteCard,
  onRestoreCard,
  onDeleteForever,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Edit Deck State
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Edit Card State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardFront, setEditCardFront] = useState("");
  const [editCardBack, setEditCardBack] = useState("");

  // AI State
  const [aiTopic, setAiTopic] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiWords, setAiWords] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiCardCount, setAiCardCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"topic" | "text">("topic");

  const dueCount = deck.cards.filter(
    (c) => c.nextReviewDate <= Date.now() && !c.isDone
  ).length;

  const startEdit = () => {
    setEditName(deck.name);
    setEditDesc(deck.description || "");
    setIsEditingDeck(true);
  };

  const saveDeckEdit = () => {
    if (editName.trim()) {
      onEditDeck(editName.trim(), editDesc.trim());
      setIsEditingDeck(false);
    }
  };

  const startEditingCard = (card: Card) => {
    setEditingCardId(card.id);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
  };

  const cancelEditingCard = () => {
    setEditingCardId(null);
    setEditCardFront("");
    setEditCardBack("");
  };

  const saveEditingCard = (originalCard: Card) => {
    if (editCardFront.trim() && editCardBack.trim()) {
      onEditCard({
        ...originalCard,
        front: editCardFront.trim(),
        back: editCardBack.trim(),
      });
      cancelEditingCard();
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    onAddCard(createNewCard(front.trim(), back.trim()));
    setFront("");
    setBack("");
    // Stay on add tab for rapid entry
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      let generatedData = [];
      const instructions = aiInstructions.trim();

      if (activeTab === "quiz") {
        if (!aiWords.trim()) return;
        generatedData = await generateQuizFromWords(aiWords, instructions);
      } else if (activeTab === "ai") {
        if (aiMode === "topic") {
          if (!aiTopic.trim()) return;
          generatedData = await generateCardsFromTopic(
            aiTopic,
            aiCardCount,
            instructions
          );
        } else if (aiMode === "text") {
          if (!aiText.trim()) return;
          generatedData = await generateCardsFromText(
            aiText,
            aiCardCount,
            instructions
          );
        }
      }

      if (generatedData.length > 0) {
        const newCards = generatedData.map((d) =>
          createNewCard(d.front, d.back)
        );
        onAddMultipleCards(newCards);
        setActiveTab("list");
        // Clear inputs after successful generation
        setAiTopic("");
        setAiText("");
        setAiWords("");
        setAiInstructions("");
      } else {
        alert("Could not generate cards. Please try a different prompt.");
      }
    } catch (error) {
      console.error(error);
      alert("Error contacting Gemini AI. Check console/API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-transparent">
      {isLoading && (
        <LoadingOverlay
          message={
            activeTab === "quiz" ? "Creating definitions..." : "Thinking..."
          }
        />
      )}

      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0 flex flex-col gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 mt-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600"
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {isEditingDeck ? (
            <div className="flex-1 space-y-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full font-bold text-lg border-b-2 border-[#2B7FFF] outline-none pb-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Deck Name"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-600 rounded-md p-2 outline-none focus:border-[#2B7FFF] bg-white dark:bg-gray-700"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingDeck(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDeckEdit}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] hover:opacity-90 rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {deck.name}
                </h1>
                <button
                  onClick={startEdit}
                  className="text-gray-400 hover:text-[#2B7FFF] p-1 rounded-full hover:bg-[#2B7FFF]/10 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
              {deck.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">
                  {deck.description}
                </p>
              )}
              <p className="text-xs text-gray-400 font-medium">
                {deck.cards.length} cards • {dueCount} due
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {theme === "light" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            {!isEditingDeck && (
              <button
                onClick={onStartStudy}
                disabled={dueCount === 0}
                className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all flex items-center gap-1.5 ${
                  dueCount > 0
                    ? "bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white hover:opacity-90 active:transform active:scale-95"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Study
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 min-w-[60px] py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "list"
              ? "border-[#2B7FFF] text-[#2B7FFF]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          Cards
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 min-w-[60px] py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "add"
              ? "border-[#2B7FFF] text-[#2B7FFF]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          Add
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 min-w-[60px] py-3 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "ai"
              ? "border-[#2B7FFF] text-[#2B7FFF]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          AI
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 min-w-[60px] py-3 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "quiz"
              ? "border-[#3CBBD1] text-[#3CBBD1]"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Quiz
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`flex-1 min-w-[60px] py-3 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "trash"
              ? "border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-transparent p-4">
        {/* LIST TAB */}
        {activeTab === "list" && (
          <div className="space-y-3 pb-safe">
            {deck.cards.length === 0 ? (
              <div className="text-center text-gray-400 py-12 px-4">
                <div className="mb-4 text-6xl opacity-20">📇</div>
                <p>No cards yet.</p>
                <p className="text-sm mt-2">
                  Use the <b>AI</b> or <b>Quiz</b> tab to generate some!
                </p>
              </div>
            ) : (
              deck.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 group"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-full text-xs text-gray-500 dark:text-gray-300 font-mono shrink-0 mt-0.5">
                    {idx + 1}
                  </div>

                  {editingCardId === card.id ? (
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase">
                          Front
                        </label>
                        <textarea
                          value={editCardFront}
                          onChange={(e) => setEditCardFront(e.target.value)}
                          className="w-full p-2 border border-[#2B7FFF]/30 rounded-lg focus:outline-none focus:border-[#2B7FFF] text-sm bg-white dark:bg-gray-700 dark:text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase">
                          Back
                        </label>
                        <textarea
                          value={editCardBack}
                          onChange={(e) => setEditCardBack(e.target.value)}
                          className="w-full p-2 border border-[#2B7FFF]/30 rounded-lg focus:outline-none focus:border-[#2B7FFF] text-sm bg-white dark:bg-gray-700 dark:text-white"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEditingCard}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditingCard(card)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] hover:opacity-90 rounded-lg"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white mb-1.5 leading-snug break-words">
                          {card.front}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm border-t border-gray-100 dark:border-gray-700 pt-2 leading-snug break-words">
                          {card.back}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditingCard(card)}
                          className="p-2 text-gray-400 hover:text-[#2B7FFF] hover:bg-[#2B7FFF]/10 rounded-lg transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this card?"))
                              onDeleteCard(card.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* MANUAL ADD TAB */}
        {activeTab === "add" && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                New Card
              </h2>
              <form onSubmit={handleManualAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Front (Question)
                  </label>
                  <textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 outline-none transition-all resize-none h-24 text-base bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. What is the capital of France?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Back (Answer)
                  </label>
                  <textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 outline-none transition-all resize-none h-24 text-base bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Paris"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white py-3.5 rounded-xl font-bold hover:opacity-90 active:opacity-100 transition-colors shadow-sm"
                >
                  Add Card
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AI GENERATE TAB */}
        {activeTab === "ai" && (
          <div className="max-w-xl mx-auto pb-6">
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-[#2B7FFF] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Generator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create study sets from topics or text.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex mb-6">
              <button
                onClick={() => setAiMode("topic")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  aiMode === "topic"
                    ? "bg-[#2B7FFF]/10 text-[#2B7FFF]"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                By Topic
              </button>
              <button
                onClick={() => setAiMode("text")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  aiMode === "text"
                    ? "bg-[#2B7FFF]/10 text-[#2B7FFF]"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                From Text
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              {aiMode === "topic" && (
                <div className="space-y-4 animate-fade-in">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Enter a Topic
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#2B7FFF]/20 bg-white dark:bg-gray-700 dark:text-white focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 outline-none"
                    placeholder="e.g. JLPT N5 Vocabulary"
                  />
                </div>
              )}

              {aiMode === "text" && (
                <div className="space-y-4 animate-fade-in">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Paste Text
                  </label>
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#2B7FFF]/20 bg-white dark:bg-gray-700 dark:text-white focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 outline-none h-40"
                    placeholder="Paste an article or notes here..."
                  />
                </div>
              )}

              <div className="mt-4 animate-fade-in">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Number of Cards:{" "}
                  <span className="text-[#2B7FFF]">{aiCardCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={aiCardCount}
                  onChange={(e) => setAiCardCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#2B7FFF]/20 rounded-lg appearance-none cursor-pointer accent-[#2B7FFF]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 animate-fade-in">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 outline-none h-20 text-sm placeholder-gray-400"
                  placeholder="e.g. 'Make the questions very difficult', 'Focus on dates'..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!process.env.API_KEY}
                className={`w-full mt-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 active:transform active:scale-95
                    ${
                      !process.env.API_KEY
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white hover:shadow-lg"
                    }`}
              >
                {!process.env.API_KEY ? (
                  "API Key Missing"
                ) : (
                  <>
                    <span>Generate</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div className="max-w-xl mx-auto pb-6">
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-[#3CBBD1] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Word Quiz Generator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paste words, get definitions automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Enter Words
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    AI will find definitions for these words.
                  </p>
                  <textarea
                    value={aiWords}
                    onChange={(e) => setAiWords(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#3CBBD1]/20 bg-white dark:bg-gray-700 dark:text-white focus:border-[#3CBBD1] focus:ring-2 focus:ring-[#3CBBD1]/20 outline-none h-40 text-base placeholder-gray-300"
                    placeholder="apple, democracy, photosynthesis, run..."
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 animate-fade-in">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:border-[#3CBBD1] focus:ring-2 focus:ring-[#3CBBD1]/20 outline-none h-20 text-sm placeholder-gray-400"
                  placeholder="e.g. 'Use simple English definitions', 'Translate to Spanish'..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!process.env.API_KEY}
                className={`w-full mt-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 active:transform active:scale-95
                        ${
                          !process.env.API_KEY
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] text-white hover:shadow-lg"
                        }`}
              >
                {!process.env.API_KEY ? (
                  "API Key Missing"
                ) : (
                  <>
                    <span>Generate Quiz</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TRASH TAB */}
        {activeTab === "trash" && (
          <div className="space-y-3 pb-safe">
            {trash.length === 0 ? (
              <div className="text-center text-gray-400 py-12 px-4">
                <div className="mb-4 text-6xl opacity-20">🗑️</div>
                <p>Trash is empty for this deck.</p>
              </div>
            ) : (
              trash.map((item) => (
                <div
                  key={item.card.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-red-50 dark:border-red-900/30 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1.5 leading-snug break-words">
                        {item.card.front}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm border-t border-gray-100 dark:border-gray-700 pt-2 leading-snug break-words">
                        {item.card.back}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-700">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this card forever? This cannot be undone."
                          )
                        ) {
                          onDeleteForever(item);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 bg-white border border-red-200 dark:bg-gray-700 dark:border-gray-600 dark:text-red-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
                      Delete
                    </button>
                    <button
                      onClick={() => onRestoreCard(item)}
                      className="px-3 py-1.5 text-xs font-medium text-green-600 bg-white border border-green-200 hover:bg-green-50 rounded-lg flex items-center gap-1 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                      </svg>
                      Restore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
