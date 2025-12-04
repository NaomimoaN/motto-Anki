import React from 'react';
import { DeletedCard, Theme } from '../types';

interface Props {
  deletedCards: DeletedCard[];
  onRestore: (deletedCard: DeletedCard) => void;
  onDeleteForever: (deletedCard: DeletedCard) => void;
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const TrashView: React.FC<Props> = ({ deletedCards, onRestore, onDeleteForever, onBack, theme, onToggleTheme }) => {
  // Sort by most recently deleted
  const sortedCards = [...deletedCards].sort((a, b) => b.deletedAt - a.deletedAt);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
            <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2B7FFF] to-[#3CBBD1]">Trash</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your deleted cards</p>
            </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedCards.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No deleted cards.</p>
        ) : (
          sortedCards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Deleted on: {new Date(card.deletedAt).toLocaleString()}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onRestore(card)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDeleteForever(card)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};