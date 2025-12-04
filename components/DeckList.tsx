import React, { useState } from "react";
import { Deck, Theme } from "../types";

interface Props {
  decks: Deck[];
  onCreateDeck: (name: string, description: string) => void;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenTrash: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const DeckList: React.FC<Props> = ({
  decks,
  onCreateDeck,
  onSelectDeck,
  onDeleteDeck,
  onOpenTrash,
  theme,
  onToggleTheme,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim(), newDeckDesc.trim());
      setNewDeckName("");
      setNewDeckDesc("");
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-20 overflow-y-auto h-full no-scrollbar bg-transparent">
      <header className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-2 rounded-xl text-[#2B7FFF] shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1]">
              My Decks
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-1">
            Ready to learn something new today?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleTheme}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-xl shadow-sm transition-all"
            title={
              theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            }
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
          <button
            onClick={onOpenTrash}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-xl shadow-sm transition-all"
            title="Trash"
          >
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
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
          >
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="hidden sm:inline">New Deck</span>
          </button>
        </div>
      </header>

      {isCreating && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#2B7FFF]/20 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck Name (e.g., Japanese Vocabulary)"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2B7FFF] focus:border-[#2B7FFF] outline-none transition-all dark:text-white"
              autoFocus
              required
            />
            <input
              type="text"
              value={newDeckDesc}
              onChange={(e) => setNewDeckDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2B7FFF] focus:border-[#2B7FFF] outline-none transition-all text-sm dark:text-white"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-opacity"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-white border border-gray-100 dark:bg-gray-700 dark:border-gray-600 text-[#2B7FFF] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            No decks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your first deck to start learning!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {decks.map((deck) => {
            const dueCount = deck.cards.filter(
              (c) => c.nextReviewDate <= Date.now() && !c.isDone
            ).length;
            return (
              <div
                key={deck.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                onClick={() => onSelectDeck(deck.id)}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this deck?"))
                        onDeleteDeck(deck.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full backdrop-blur-sm"
                  >
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
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate pr-8">
                    {deck.name}
                  </h3>
                  {deck.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {deck.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mt-4 border-t border-gray-50 dark:border-gray-700 pt-3">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deck.cards.length}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-medium uppercase tracking-wide">
                      cards
                    </span>
                  </div>

                  {dueCount > 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-amber-500 text-amber-700 dark:text-amber-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      {dueCount} DUE
                    </div>
                  ) : (
                    <div className="text-green-600 dark:text-green-500 text-xs font-bold flex items-center gap-1 bg-white dark:bg-gray-900 border border-green-500 px-2 py-1 rounded-md">
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
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      DONE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
