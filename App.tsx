import React, { useState, useEffect } from "react";
import { Deck, ViewState, Card, DeletedCard, Theme } from "./types";
import { DeckList } from "./components/DeckList";
import { DeckView } from "./components/DeckView";
import { StudySession } from "./components/StudySession";
import { TrashView } from "./components/TrashView";

const STORAGE_KEY = "flashgenius_decks_v1";
const TRASH_KEY = "flashgenius_trash_v1";

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [trash, setTrash] = useState<DeletedCard[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ type: "DASHBOARD" });
  const [theme, setTheme] = useState<Theme>("light");

  // Load from local storage on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem(STORAGE_KEY);
    const savedTrash = localStorage.getItem(TRASH_KEY);

    if (savedDecks) {
      try {
        setDecks(JSON.parse(savedDecks));
      } catch (e) {
        console.error("Failed to load decks", e);
      }
    } else {
      // Initial Demo Deck
      setDecks([
        {
          id: "demo-deck",
          name: "Demo: Langara College Instructor",
          description: "Learn the Instructor of Langara College.",
          createdAt: Date.now(),
          cards: [
            {
              id: "c1",
              front: "Jason Madore",
              back: "Advanced topics Instractor and coordinator of the WMDD",
              createdAt: Date.now(),
              interval: 0,
              repetition: 0,
              easeFactor: 2.5,
              nextReviewDate: Date.now(),
            },
            {
              id: "c2",
              front: "Tomoko Okouchi",
              back: "HTML, CSS, JavaScript, Object-Oriented Programming, and Full Stack Development Instructor",
              createdAt: Date.now(),
              interval: 0,
              repetition: 0,
              easeFactor: 2.5,
              nextReviewDate: Date.now(),
            },
            {
              id: "c3",
              front: "Reza Etemadi",
              back: "JavaScript2 Instructor",
              createdAt: Date.now(),
              interval: 0,
              repetition: 0,
              easeFactor: 2.5,
              nextReviewDate: Date.now(),
            },
            {
              id: "c4",
              front: "Richard Wong",
              back: "Project2 Instructor",
              createdAt: Date.now(),
              interval: 0,
              repetition: 0,
              easeFactor: 2.5,
              nextReviewDate: Date.now(),
            },
          ],
        },
      ]);
    }

    if (savedTrash) {
      try {
        setTrash(JSON.parse(savedTrash));
      } catch (e) {
        console.error("Failed to load trash", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  }, [trash]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleCreateDeck = (name: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description,
      cards: [],
      createdAt: Date.now(),
    };
    setDecks((prev) => [...prev, newDeck]);
  };

  const handleEditDeck = (
    deckId: string,
    name: string,
    description: string
  ) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          return { ...deck, name, description };
        }
        return deck;
      })
    );
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  const handleAddCard = (deckId: string, card: Card) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          return { ...deck, cards: [...deck.cards, card] };
        }
        return deck;
      })
    );
  };

  const handleAddMultipleCards = (deckId: string, cards: Card[]) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          return { ...deck, cards: [...deck.cards, ...cards] };
        }
        return deck;
      })
    );
  };

  const handleUpdateCard = (deckId: string, updatedCard: Card) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === updatedCard.id ? updatedCard : c
            ),
          };
        }
        return deck;
      })
    );
  };

  // Soft delete: Move to Trash
  const handleDeleteCard = (deckId: string, cardId: string) => {
    let cardToDelete: Card | undefined;
    let originDeckName = "";

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          cardToDelete = deck.cards.find((c) => c.id === cardId);
          originDeckName = deck.name;
          return {
            ...deck,
            cards: deck.cards.filter((c) => c.id !== cardId),
          };
        }
        return deck;
      })
    );

    if (cardToDelete) {
      const deletedItem: DeletedCard = {
        card: cardToDelete,
        originDeckId: deckId,
        originDeckName: originDeckName,
        deletedAt: Date.now(),
      };
      setTrash((prev) => [deletedItem, ...prev]);
    }
  };

  const handleRestoreCard = (deletedItem: DeletedCard) => {
    setDecks((prev) => {
      // Try to find the original deck
      const deckExists = prev.some((d) => d.id === deletedItem.originDeckId);

      if (deckExists) {
        return prev.map((deck) => {
          if (deck.id === deletedItem.originDeckId) {
            return { ...deck, cards: [...deck.cards, deletedItem.card] };
          }
          return deck;
        });
      } else {
        // If deck doesn't exist (was deleted), create a "Restored Cards" deck or add to first deck
        const restoredDeckId = "restored-deck";
        const restoredDeck = prev.find((d) => d.id === restoredDeckId);

        if (restoredDeck) {
          return prev.map((d) =>
            d.id === restoredDeckId
              ? { ...d, cards: [...d.cards, deletedItem.card] }
              : d
          );
        } else {
          return [
            ...prev,
            {
              id: restoredDeckId,
              name: "Restored Cards",
              description: "Cards restored from deleted decks",
              createdAt: Date.now(),
              cards: [deletedItem.card],
            },
          ];
        }
      }
    });

    // Remove from trash
    setTrash((prev) =>
      prev.filter((item) => item.card.id !== deletedItem.card.id)
    );
  };

  const handlePermanentDelete = (deletedItem: DeletedCard) => {
    setTrash((prev) =>
      prev.filter((item) => item.card.id !== deletedItem.card.id)
    );
  };

  // Render View Switcher
  const renderView = () => {
    switch (viewState.type) {
      case "DASHBOARD":
        return (
          <DeckList
            decks={decks}
            onCreateDeck={handleCreateDeck}
            onSelectDeck={(id) =>
              setViewState({ type: "DECK_VIEW", deckId: id })
            }
            onDeleteDeck={handleDeleteDeck}
            onOpenTrash={() => setViewState({ type: "TRASH" })}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );

      case "TRASH":
        return (
          <TrashView
            deletedCards={trash}
            onRestore={handleRestoreCard}
            onDeleteForever={handlePermanentDelete}
            onBack={() => setViewState({ type: "DASHBOARD" })}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );

      case "DECK_VIEW": {
        const deck = decks.find((d) => d.id === viewState.deckId);
        if (!deck) return <div className="p-4">Deck not found</div>;

        // Filter trash for this specific deck
        const deckTrash = trash.filter((t) => t.originDeckId === deck.id);

        return (
          <DeckView
            deck={deck}
            trash={deckTrash}
            onBack={() => setViewState({ type: "DASHBOARD" })}
            onEditDeck={(name, description) =>
              handleEditDeck(deck.id, name, description)
            }
            onStartStudy={() =>
              setViewState({ type: "STUDY_SESSION", deckId: deck.id })
            }
            onAddCard={(card) => handleAddCard(deck.id, card)}
            onAddMultipleCards={(cards) =>
              handleAddMultipleCards(deck.id, cards)
            }
            onEditCard={(card) => handleUpdateCard(deck.id, card)}
            onDeleteCard={(cardId) => handleDeleteCard(deck.id, cardId)}
            onRestoreCard={handleRestoreCard}
            onDeleteForever={handlePermanentDelete}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      }

      case "STUDY_SESSION": {
        const deck = decks.find((d) => d.id === viewState.deckId);
        if (!deck) return <div className="p-4">Deck not found</div>;

        return (
          <StudySession
            cards={deck.cards}
            onComplete={() =>
              setViewState({ type: "DECK_VIEW", deckId: deck.id })
            }
            onUpdateCard={(card) => handleUpdateCard(deck.id, card)}
            theme={theme}
          />
        );
      }
    }
  };

  return (
    <div
      className={`h-full font-sans text-gray-900 dark:text-gray-100 relative ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-300">
        {theme === "light" ? (
          <div className="absolute inset-0 bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B7FFF] to-[#3CBBD1] opacity-[0.06]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-950"></div>
        )}
      </div>

      {renderView()}
    </div>
  );
};

export default App;
