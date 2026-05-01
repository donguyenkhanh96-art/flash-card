type ActivityDay = {
  date: string;
  reviews: number;
};

function colorClass(count: number): string {
  if (count === 0) return "bg-slate-200";
  if (count < 3) return "bg-emerald-200";
  if (count < 6) return "bg-emerald-300";
  if (count < 10) return "bg-emerald-500";
  return "bg-emerald-700";
}

export function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Activity (last 90 days)</h2>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.reviews} reviews`}
            className={`h-4 w-4 rounded-sm ${colorClass(day.reviews)}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Darker cells mean more reviews on that day.
      </p>
    </div>
  );
}
