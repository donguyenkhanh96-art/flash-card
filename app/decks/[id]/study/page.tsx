import Link from "next/link";
import { StudySession } from "../../../../components/study-session";
import { getDeckById, getDueCards } from "../../../../lib/services/flashcards";

type PageProps = {
  params: { id: string };
  searchParams?: { userId?: string };
};

export const dynamic = "force-dynamic";

export default async function StudyDeckPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const userId = searchParams?.userId ?? process.env.DEMO_USER_ID ?? "demo-user";

  const [deck, dueCards] = await Promise.all([
    getDeckById(id),
    getDueCards({ userId, deckId: id, limit: 100 }),
  ]);

  if (!deck) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-slate-600">Deck not found.</p>
        <Link className="mt-4 inline-block underline" href="/">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-5">
        <Link href="/" className="text-sm text-slate-600 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{deck.name}</h1>
        <p className="text-sm text-slate-600">{deck.description || "No description"}</p>
      </div>

      <StudySession initialDueCards={dueCards} userId={userId} />
    </main>
  );
}
