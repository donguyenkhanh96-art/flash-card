"use client";

import { useMemo, useState, useTransition } from "react";

type DueCard = {
  id: string;
  cardId: string;
  card: {
    id: string;
    frontContent: string;
    backContent: string;
  };
};

type ReviewResponse = {
  totalXp: number;
};

const gradeButtons: Array<{ grade: 1 | 2 | 3 | 4; label: string }> = [
  { grade: 1, label: "Again" },
  { grade: 2, label: "Hard" },
  { grade: 3, label: "Good" },
  { grade: 4, label: "Easy" },
];

export function StudySession({
  initialDueCards,
  userId,
}: {
  initialDueCards: DueCard[];
  userId: string;
}) {
  const [dueCards, setDueCards] = useState(initialDueCards);
  const [showBack, setShowBack] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = useMemo(() => dueCards[0], [dueCards]);

  const handleReview = (grade: 1 | 2 | 3 | 4) => {
    if (!current) return;

    startTransition(async () => {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          cardId: current.card.id,
          grade,
        }),
      });

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as ReviewResponse;
      setXp(data.totalXp);
      setDueCards((prev) => prev.slice(1));
      setShowBack(false);
    });
  };

  if (!current) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <h2 className="text-xl font-semibold">No due cards</h2>
        <p className="mt-2 text-slate-600">Come back later for the next review.</p>
        {xp !== null && <p className="mt-4 font-medium">Current XP: {xp}</p>}
      </div>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6">
      <p className="mb-2 text-sm text-slate-500">{dueCards.length} due cards left</p>
      {xp !== null && <p className="mb-2 text-sm font-medium">Current XP: {xp}</p>}

      <div className="mb-4 min-h-40 rounded border bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Front</h2>
        <p className="mt-2 whitespace-pre-wrap">{current.card.frontContent}</p>
      </div>

      {showBack ? (
        <div className="mb-4 min-h-40 rounded border bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold">Back</h2>
          <p className="mt-2 whitespace-pre-wrap">{current.card.backContent}</p>
        </div>
      ) : (
        <button
          onClick={() => setShowBack(true)}
          className="mb-4 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Reveal answer
        </button>
      )}

      {showBack && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gradeButtons.map((button) => (
            <button
              key={button.grade}
              disabled={isPending}
              onClick={() => handleReview(button.grade)}
              className="rounded border px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
