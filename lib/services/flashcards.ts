import { prisma } from "../prisma";
import { calculateSm2, xpForGrade } from "../srs";

type CreateDeckInput = {
  userId: string;
  name: string;
  description?: string;
};

type CreateCardInput = {
  userId: string;
  deckId: string;
  frontContent: string;
  backContent: string;
};

type GetDueCardsInput = {
  userId: string;
  deckId?: string;
  limit?: number;
};

type SubmitReviewInput = {
  userId: string;
  cardId: string;
  grade: 1 | 2 | 3 | 4;
};

async function ensureUserExists(userId: string) {
  const email = `${userId}@flashcard.local`;
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email,
      name: "Demo User",
    },
  });
}

export async function createDeck(input: CreateDeckInput) {
  await ensureUserExists(input.userId);
  return prisma.deck.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      createdById: input.userId,
    },
  });
}

export async function listDecks() {
  return prisma.deck.findMany({
    include: {
      _count: {
        select: { cards: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeckById(deckId: string) {
  return prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        orderBy: { createdAt: "asc" },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function createCard(input: CreateCardInput) {
  const deck = await prisma.deck.findUnique({
    where: { id: input.deckId },
    select: { id: true, createdById: true },
  });

  if (!deck) {
    throw new Error("Deck not found.");
  }

  if (deck.createdById !== input.userId) {
    throw new Error("Not allowed to add cards to this deck.");
  }

  return prisma.card.create({
    data: {
      deckId: input.deckId,
      frontContent: input.frontContent.trim(),
      backContent: input.backContent.trim(),
    },
  });
}

async function ensureProgressRowsForUserCards(input: {
  userId: string;
  deckId?: string;
}) {
  const cards = await prisma.card.findMany({
    where: input.deckId ? { deckId: input.deckId } : undefined,
    select: { id: true },
  });

  if (!cards.length) {
    return;
  }

  await prisma.userCardProgress.createMany({
    data: cards.map((card) => ({
      userId: input.userId,
      cardId: card.id,
    })),
    skipDuplicates: true,
  });
}

export async function getDueCards(input: GetDueCardsInput) {
  await ensureUserExists(input.userId);
  await ensureProgressRowsForUserCards({
    userId: input.userId,
    deckId: input.deckId,
  });

  return prisma.userCardProgress.findMany({
    where: {
      userId: input.userId,
      nextReviewDate: { lte: new Date() },
      ...(input.deckId ? { card: { deckId: input.deckId } } : {}),
    },
    include: {
      card: {
        include: {
          deck: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: [{ nextReviewDate: "asc" }, { updatedAt: "asc" }],
    take: input.limit ?? 20,
  });
}

export async function submitReview(input: SubmitReviewInput) {
  await ensureUserExists(input.userId);
  if (![1, 2, 3, 4].includes(input.grade)) {
    throw new Error("Grade must be between 1 and 4.");
  }

  const card = await prisma.card.findUnique({
    where: { id: input.cardId },
    select: { id: true },
  });

  if (!card) {
    throw new Error("Card not found.");
  }

  const reviewResult = await prisma.$transaction(async (tx) => {
    let progress = await tx.userCardProgress.findUnique({
      where: {
        userId_cardId: {
          userId: input.userId,
          cardId: input.cardId,
        },
      },
    });

    if (!progress) {
      progress = await tx.userCardProgress.create({
        data: {
          userId: input.userId,
          cardId: input.cardId,
        },
      });
    }

    const sm2 = calculateSm2({
      grade: input.grade,
      interval: progress.interval,
      easeFactor: progress.easeFactor,
      repetitions: progress.repetitions,
    });

    const updatedProgress = await tx.userCardProgress.update({
      where: { id: progress.id },
      data: {
        interval: sm2.interval,
        easeFactor: sm2.easeFactor,
        repetitions: sm2.repetitions,
        nextReviewDate: sm2.nextReviewDate,
      },
      include: {
        card: {
          include: {
            deck: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await tx.reviewLog.create({
      data: {
        userId: input.userId,
        cardId: input.cardId,
        grade: input.grade,
      },
    });

    const user = await tx.user.update({
      where: { id: input.userId },
      data: {
        totalXp: {
          increment: xpForGrade(input.grade),
        },
      },
      select: { id: true, totalXp: true },
    });

    return {
      updatedProgress,
      totalXp: user.totalXp,
    };
  });

  return reviewResult;
}

export async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    orderBy: { totalXp: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      totalXp: true,
    },
  });
}

export async function getReviewActivity(days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const logs = await prisma.reviewLog.findMany({
    where: {
      reviewDate: {
        gte: startDate,
      },
    },
    select: {
      reviewDate: true,
    },
  });

  const byDate = logs.reduce<Record<string, number>>((acc, log) => {
    const day = log.reviewDate.toISOString().slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  return Array.from({ length: days }, (_, idx) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + idx);
    const key = day.toISOString().slice(0, 10);
    return {
      date: key,
      reviews: byDate[key] ?? 0,
    };
  });
}
