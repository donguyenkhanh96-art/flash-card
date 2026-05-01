import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "../../../lib/services/flashcards";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, grade } = body as {
      cardId?: string;
      grade?: number;
    };

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
      userId: session.user.id,
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
