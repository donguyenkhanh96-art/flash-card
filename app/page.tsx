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
  const totalCards = decks.reduce((sum, deck) => sum + deck._count.cards, 0);
  const totalXp = leaderboard.reduce((sum, user) => sum + user.totalXp, 0);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <section className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          FlashCard MVP
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Learning Dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse decks, track XP leaderboard, and inspect learning activity.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Total decks</p>
            <p className="text-xl font-semibold">{decks.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Total cards</p>
            <p className="text-xl font-semibold">{totalCards}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Community XP</p>
            <p className="text-xl font-semibold">{totalXp}</p>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decks</h2>
          <p className="text-xs text-slate-500">{decks.length} available</p>
        </div>
        {decks.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed p-4 text-sm text-slate-500">
            No decks yet. Create one using API or Step 4 form enhancement.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {decks.map((deck) => (
              <article
                key={deck.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <h3 className="line-clamp-1 font-semibold">{deck.name}</h3>
                <p className="mt-1 min-h-10 text-sm text-slate-600">
                  {deck.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {deck._count.cards} cards
                </p>
                <Link
                  className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  href={`/decks/${deck.id}/study?userId=${DEMO_USER_ID}`}
                >
                  Study deck
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Leaderboard (Top 20)</h2>
        {leaderboard.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed p-4 text-sm text-slate-500">
            No users yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {leaderboard.map((user, index) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span>
                  #{index + 1} {user.name || user.email}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                  {user.totalXp} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActivityHeatmap days={activity} />
    </main>
  );
}
