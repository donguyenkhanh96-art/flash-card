"use server";

import { submitReview } from "../../lib/services/flashcards";

export async function submitReviewAction(input: {
  userId: string;
  cardId: string;
  grade: 1 | 2 | 3 | 4;
}) {
  if (!input.userId) throw new Error("Missing userId.");
  if (!input.cardId) throw new Error("Missing cardId.");

  return submitReview(input);
}
