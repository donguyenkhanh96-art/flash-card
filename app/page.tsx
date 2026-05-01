import Link from "next/link";
import { ActivityHeatmap } from "../components/activity-heatmap";
import {
  getLeaderboard,
  getReviewActivity,
  listDecks,
} from "../lib/services/flashcards";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "demo-user";

export default async function DashboardPage() {
  const [decks, leaderboard, activity] = await Promise.all([
    listDecks(),
    getLeaderboard(20),
    getReviewActivity(90),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-bold">FlashCard MVP Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Browse decks, track XP leaderboard, and inspect learning activity.
        </p>
      </section>

      <section className="mb-8 rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Decks</h2>
        {decks.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No decks yet. Create one using API or Step 4 form enhancement.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {decks.map((deck) => (
              <article key={deck.id} className="rounded border p-4">
                <h3 className="font-semibold">{deck.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {deck.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {deck._count.cards} cards
                </p>
                <Link
                  className="mt-3 inline-block rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
                  href={`/decks/${deck.id}/study?userId=${DEMO_USER_ID}`}
                >
                  Study deck
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Leaderboard (Top 20)</h2>
        {leaderboard.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No users yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {leaderboard.map((user, index) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <span>
                  #{index + 1} {user.name || user.email}
                </span>
                <span className="font-semibold">{user.totalXp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActivityHeatmap days={activity} />
    </main>
  );
}
