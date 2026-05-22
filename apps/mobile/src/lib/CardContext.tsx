import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CardInfo {
  id: string; // Firestore doc ID
  number: string; // masked number e.g., **** **** **** 1234
  holderName: string;
  expiry: string; // MM/YY
  brand: string; // e.g., Visa, MasterCard
}

interface CardContextProps {
  cards: CardInfo[];
  addCard: (card: Omit<CardInfo, 'id'>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  loadCards: () => Promise<void>;
}

const CardContext = createContext<CardContextProps | undefined>(undefined);

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<CardInfo[]>([]);

  const loadCards = async () => {
    // placeholder: actual Firestore loading will be done in component using this provider
    // For now we keep empty list until user loads.
    setCards([]);
  };

  const addCard = async (card: Omit<CardInfo, 'id'>) => {
    // Generate a temporary ID; real implementation will use Firestore addDoc
    const id = Math.random().toString(36).substring(2, 9);
    const newCard: CardInfo = { id, ...card };
    setCards(prev => [...prev, newCard]);
  };

  const removeCard = async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CardContext.Provider value={{ cards, addCard, removeCard, loadCards }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = (): CardContextProps => {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('useCards must be used within CardProvider');
  return ctx;
};
