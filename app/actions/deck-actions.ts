"use server";

import {
  createCard,
  createDeck,
  getDeckById,
  getDueCards,
  listDecks,
} from "../../lib/services/flashcards";

export async function createDeckAction(input: {
  userId: string;
  name: string;
  description?: string;
}) {
  if (!input.userId) throw new Error("Missing userId.");
  if (!input.name?.trim()) throw new Error("Deck name is required.");

  return createDeck(input);
}

export async function listDecksAction() {
  return listDecks();
}

export async function getDeckByIdAction(deckId: string) {
  if (!deckId) throw new Error("Missing deckId.");
  return getDeckById(deckId);
}

export async function createCardAction(input: {
  userId: string;
  deckId: string;
  frontContent: string;
  backContent: string;
}) {
  if (!input.userId) throw new Error("Missing userId.");
  if (!input.deckId) throw new Error("Missing deckId.");
  if (!input.frontContent?.trim()) throw new Error("Front content is required.");
  if (!input.backContent?.trim()) throw new Error("Back content is required.");

  return createCard(input);
}

export async function getDueCardsAction(input: {
  userId: string;
  deckId?: string;
  limit?: number;
}) {
  if (!input.userId) throw new Error("Missing userId.");

  return getDueCards(input);
}
