import { db } from "~/server/db";

export default async function AnalyticsPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;
  const rid = restaurant.id;

  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const viewCounts = await Promise.all(
    days.map(async (d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return db.analyticsEvent.count({
        where: { restaurantId: rid, type: "page_view", createdAt: { gte: d, lt: next } },
      });
    }),
  );

  const [totalViews, langBreakdown] = await Promise.all([
    db.analyticsEvent.count({ where: { restaurantId: rid, type: "page_view" } }),
    db.analyticsEvent.groupBy({
      by: ["meta"],
      where: { restaurantId: rid, type: "language_change" },
      _count: true,
    }),
  ]);

  const maxViews = Math.max(...viewCounts, 1);
  const dayLabels = days.map((d) =>
    d.toLocaleDateString("en", { weekday: "short" }),
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Cookieless, privacy-first menu analytics.
        </p>
      </div>

      {/* Total */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <p className="text-sm font-medium" style={{ color: "#78716C" }}>
          Total menu views (all time)
        </p>
        <p className="mt-1 text-5xl font-bold tabular-nums" style={{ color: "#1A3A6C" }}>
          {totalViews.toLocaleString("pt-PT")}
        </p>
      </div>

      {/* 7-day bar chart */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <p className="mb-4 text-sm font-semibold" style={{ color: "#1C1917" }}>
          Views — last 7 days
        </p>
        <div className="flex items-end gap-2" style={{ height: "120px" }}>
          {viewCounts.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs tabular-nums" style={{ color: "#78716C" }}>{n}</span>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${Math.max((n / maxViews) * 90, n > 0 ? 4 : 2)}px`,
                  background: n > 0 ? "#1A3A6C" : "#E8E0D8",
                }}
              />
              <span className="text-xs" style={{ color: "#A8A29E" }}>{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Language distribution */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <p className="mb-4 text-sm font-semibold" style={{ color: "#1C1917" }}>
          Language selections
        </p>
        {langBreakdown.length === 0 ? (
          <p className="text-sm" style={{ color: "#A8A29E" }}>
            No language change events recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {langBreakdown.map((row, i) => {
              const meta = row.meta as Record<string, string> | null;
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-6 font-semibold uppercase" style={{ color: "#1C1917" }}>
                    {meta?.locale ?? "?"}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full" style={{ background: "#F0EBE3", height: "8px" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: "60%", background: "#6B1D2A" }}
                    />
                  </div>
                  <span className="tabular-nums" style={{ color: "#78716C" }}>{row._count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "#A8A29E" }}>
        Data updates in real time as customers scan your QR code. No personal data is collected.
      </p>
    </div>
  );
}
