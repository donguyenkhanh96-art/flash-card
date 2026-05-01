import { NextResponse } from "next/server";
import {
  createCard,
  createDeck,
  getDeckById,
} from "../../../../lib/services/flashcards";

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "demo-user";

export async function POST() {
  try {
    const deck = await createDeck({
      userId: DEMO_USER_ID,
      name: "English Vocabulary",
      description: "Starter deck for local MVP preview",
    });

    await createCard({
      userId: DEMO_USER_ID,
      deckId: deck.id,
      frontContent: "abandon",
      backContent: "to leave behind; to give up completely",
    });

    await createCard({
      userId: DEMO_USER_ID,
      deckId: deck.id,
      frontContent: "diligent",
      backContent: "showing careful and persistent work",
    });

    const fullDeck = await getDeckById(deck.id);
    return NextResponse.json({ deck: fullDeck }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to seed demo data.",
      },
      { status: 500 }
    );
  }
}
