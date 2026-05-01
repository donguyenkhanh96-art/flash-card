import { NextRequest, NextResponse } from "next/server";
import { getDueCards } from "../../../../lib/services/flashcards";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const deckId = request.nextUrl.searchParams.get("deckId") ?? undefined;
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    const dueCards = await getDueCards({
      userId,
      deckId,
      limit: Number.isFinite(limit) ? limit : undefined,
    });

    return NextResponse.json({ dueCards });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch due cards.",
      },
      { status: 500 }
    );
  }
}
