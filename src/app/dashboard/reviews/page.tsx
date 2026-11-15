import { Star } from "lucide-react";
import { db } from "~/server/db";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.5}
          style={{ color: i <= n ? "#F59E0B" : "#D6D3D1", fill: i <= n ? "#F59E0B" : "none" }}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;

  const reviews = await db.review.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
  });

  const dist = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));
  const avg = reviews.length
    ? reviews.reduce((s, rv) => s + rv.rating, 0) / reviews.length
    : 0;
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Review Inbox
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Feedback from customers. 4+ stars went to Google; under 4 stars are stored here.
        </p>
      </div>

      {/* Summary */}
      <div
        className="grid grid-cols-2 gap-6 rounded-2xl p-6 sm:grid-cols-4"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: "#1A3A6C" }}>
            {avg > 0 ? avg.toFixed(1) : "—"}
          </p>
          <p className="text-sm" style={{ color: "#78716C" }}>Average rating</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: "#1A3A6C" }}>
            {reviews.length}
          </p>
          <p className="text-sm" style={{ color: "#78716C" }}>Total reviews</p>
        </div>
        <div className="col-span-2">
          <div className="space-y-1.5">
            {dist.map(({ r, count }) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right" style={{ color: "#78716C" }}>{r}★</span>
                <div className="flex-1 overflow-hidden rounded-full" style={{ background: "#F0EBE3", height: "6px" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: r >= 4 ? "#2D6A4F" : r === 3 ? "#92400E" : "#DC2626",
                    }}
                  />
                </div>
                <span className="w-4 tabular-nums" style={{ color: "#A8A29E" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div
          className="rounded-2xl px-6 py-12 text-center"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          <Star size={36} strokeWidth={1.25} style={{ color: "#D6D3D1", margin: "0 auto" }} />
          <p className="mt-3 font-medium" style={{ color: "#1C1917" }}>No reviews yet</p>
          <p className="text-sm" style={{ color: "#78716C" }}>
            Reviews appear here when customers rate under 4 stars.
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className="flex items-start gap-4 px-5 py-4"
              style={{ borderTop: i > 0 ? "1px solid #F7F5F2" : "none" }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background:
                    r.rating >= 4 ? "#2D6A4F" : r.rating >= 3 ? "#92400E" : "#DC2626",
                }}
              >
                {r.rating}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Stars n={r.rating} />
                  <span className="text-xs" style={{ color: "#A8A29E" }}>
                    {r.locale?.toUpperCase() ?? "—"} · {r.tableNumber ? `Table ${r.tableNumber} · ` : ""}
                    {r.createdAt.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.comment ? (
                  <p className="mt-1 text-sm" style={{ color: "#1C1917" }}>{r.comment}</p>
                ) : (
                  <p className="mt-1 text-sm italic" style={{ color: "#A8A29E" }}>No comment left.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
