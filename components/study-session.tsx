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
  const [totalAtStart] = useState(initialDueCards.length);
  const [dueCards, setDueCards] = useState(initialDueCards);
  const [showBack, setShowBack] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = useMemo(() => dueCards[0], [dueCards]);

  const handleReview = (grade: 1 | 2 | 3 | 4) => {
    if (!current) return;

    startTransition(async () => {
      setError(null);
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
        setError("Failed to submit review. Please try again.");
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold">No due cards</h2>
        <p className="mt-2 text-slate-600">Come back later for the next review.</p>
        {xp !== null && (
          <p className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            Current XP: {xp}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Card {totalAtStart - dueCards.length + 1} / {totalAtStart}
        </p>
        <p className="text-sm text-slate-500">{dueCards.length} due cards left</p>
      </div>

      {xp !== null && (
        <p className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
          Current XP: {xp}
        </p>
      )}

      <div className="mb-4 min-h-44 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Front</h2>
        <p className="mt-2 whitespace-pre-wrap">{current.card.frontContent}</p>
      </div>

      {showBack ? (
        <div className="mb-4 min-h-44 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Back</h2>
          <p className="mt-2 whitespace-pre-wrap">{current.card.backContent}</p>
        </div>
      ) : (
        <button
          onClick={() => setShowBack(true)}
          className="mb-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Reveal answer
        </button>
      )}

      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {showBack && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gradeButtons.map((button) => (
            <button
              key={button.grade}
              disabled={isPending}
              onClick={() => handleReview(button.grade)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60"
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
