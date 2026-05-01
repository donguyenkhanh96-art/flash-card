import { NextRequest, NextResponse } from "next/server";
import { createDeck, listDecks } from "../../../lib/services/flashcards";

export async function GET() {
  try {
    const decks = await listDecks();
    return NextResponse.json({ decks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch decks." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description } = body as {
      userId?: string;
      name?: string;
      description?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Deck name is required." }, { status: 400 });
    }

    const deck = await createDeck({
      userId,
      name,
      description,
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create deck." },
      { status: 500 }
    );
  }
}
