import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "../../../lib/services/flashcards";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cardId, grade } = body as {
      userId?: string;
      cardId?: string;
      grade?: number;
    };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }
    if (!cardId) {
      return NextResponse.json({ error: "Missing cardId." }, { status: 400 });
    }
    if (![1, 2, 3, 4].includes(grade ?? 0)) {
      return NextResponse.json(
        { error: "grade must be one of 1, 2, 3, 4." },
        { status: 400 }
      );
    }

    const result = await submitReview({
      userId,
      cardId,
      grade: grade as 1 | 2 | 3 | 4,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit review." },
      { status: 500 }
    );
  }
}
