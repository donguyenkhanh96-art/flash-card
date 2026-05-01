import { NextRequest, NextResponse } from "next/server";
import {
  createCard,
  getDeckById,
} from "../../../../../lib/services/flashcards";

type RouteContext = {
  params: { id: string };
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const deck = await getDeckById(id);

    if (!deck) {
      return NextResponse.json({ error: "Deck not found." }, { status: 404 });
    }

    return NextResponse.json({ deck, cards: deck.cards });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch cards." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { userId, frontContent, backContent } = body as {
      userId?: string;
      frontContent?: string;
      backContent?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }
    if (!frontContent?.trim()) {
      return NextResponse.json({ error: "Front content is required." }, { status: 400 });
    }
    if (!backContent?.trim()) {
      return NextResponse.json({ error: "Back content is required." }, { status: 400 });
    }

    const card = await createCard({
      userId,
      deckId: id,
      frontContent,
      backContent,
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create card." },
      { status: 500 }
    );
  }
}
