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
  const totalReviews = days.reduce((sum, day) => sum + day.reviews, 0);
  const activeDays = days.filter((day) => day.reviews > 0).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Activity (last 90 days)</h2>
        <p className="text-xs text-slate-500">
          {totalReviews} reviews on {activeDays} days
        </p>
      </div>
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
      <p className="mt-4 text-xs text-slate-500">
        Darker cells mean more reviews on that day.
      </p>
    </div>
  );
}
