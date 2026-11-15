import Link from "next/link";
import { Bell, Download, Settings, Star, UtensilsCrossed } from "lucide-react";
import { db } from "~/server/db";

export default async function DashboardOverview() {
  const restaurant = await db.restaurant.findFirst({
    where: { slug: "alma-portuguesa" },
  });
  if (!restaurant) return <p>Restaurant not found.</p>;

  const rid = restaurant.id;

  const [
    totalDishes,
    availableDishes,
    featuredDishes,
    totalCategories,
    weeklyReviews,
    pageViewsToday,
    pageViewsWeek,
    unresolvedCalls,
    recentReviews,
  ] = await Promise.all([
    db.dish.count({ where: { category: { restaurantId: rid } } }),
    db.dish.count({ where: { category: { restaurantId: rid }, isAvailable: true } }),
    db.dish.count({ where: { category: { restaurantId: rid }, isFeatured: true } }),
    db.category.count({ where: { restaurantId: rid } }),
    db.review.aggregate({
      where: { restaurantId: rid, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      _avg: { rating: true },
      _count: true,
    }),
    db.analyticsEvent.count({
      where: { restaurantId: rid, type: "page_view", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.analyticsEvent.count({
      where: { restaurantId: rid, type: "page_view", createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
    db.waiterCall.count({ where: { restaurantId: rid, resolved: false } }),
    db.review.findMany({ where: { restaurantId: rid }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Total Dishes", value: totalDishes, sub: `${availableDishes} available`, color: "#1A3A6C" },
    { label: "Sold Out", value: totalDishes - availableDishes, sub: "need restocking", color: "#DC2626" },
    { label: "Featured", value: featuredDishes, sub: "in Chef's Picks", color: "#6B1D2A" },
    { label: "Categories", value: totalCategories, sub: "on the menu", color: "#2D6A4F" },
    { label: "Reviews (7d)", value: weeklyReviews._count, sub: weeklyReviews._avg.rating ? `avg ${weeklyReviews._avg.rating.toFixed(1)} ★` : "no ratings yet", color: "#92400E" },
    { label: "Menu Views Today", value: pageViewsToday, sub: `${pageViewsWeek} this week`, color: "#4C1D95" },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Good {getTimeOfDay()}, {restaurant.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Here&apos;s what&apos;s happening with your restaurant today.
        </p>
      </div>

      {/* Unresolved call banner */}
      {unresolvedCalls > 0 && (
        <Link
          href="/dashboard/calls"
          className="flex items-center gap-3 rounded-xl px-5 py-4 text-white transition-opacity hover:opacity-90"
          style={{ background: "#DC2626" }}
        >
          <Bell size={20} strokeWidth={2} />
          <div>
            <p className="font-semibold">
              {unresolvedCalls} unresolved table call{unresolvedCalls > 1 ? "s" : ""}
            </p>
            <p className="text-sm opacity-80">Tap to view and resolve</p>
          </div>
          <span className="ml-auto text-xl">→</span>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid #E8E0D8" }}
          >
            <p className="text-sm font-medium" style={{ color: "#78716C" }}>
              {s.label}
            </p>
            <p
              className="mt-1 text-3xl font-bold tabular-nums"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "#A8A29E" }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/dashboard/menu",     Icon: UtensilsCrossed, label: "Edit menu" },
            { href: "/dashboard/reviews",  Icon: Star,            label: "View reviews" },
            { href: "/dashboard/qr",       Icon: Download,        label: "Download QR" },
            { href: "/dashboard/settings", Icon: Settings,        label: "Settings" },
          ].map(({ href, Icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ background: "white", border: "1px solid #E8E0D8", color: "#1C1917" }}
            >
              <Icon size={18} strokeWidth={1.75} style={{ color: "#6B1D2A", flexShrink: 0 }} />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
            Recent feedback
          </h2>
          <div className="overflow-hidden rounded-2xl" style={{ background: "white", border: "1px solid #E8E0D8" }}>
            {recentReviews.map((r, i) => (
              <div
                key={r.id}
                className="flex items-start gap-4 px-5 py-4"
                style={{ borderTop: i > 0 ? "1px solid #F0EBE3" : "none" }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: r.rating >= 4 ? "#2D6A4F" : r.rating >= 3 ? "#92400E" : "#DC2626" }}
                >
                  {r.rating}★
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: "#1C1917" }}>
                    {r.comment ?? <em style={{ color: "#A8A29E" }}>No comment</em>}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "#A8A29E" }}>
                    {r.locale?.toUpperCase() ?? "—"} · {r.createdAt.toLocaleDateString("pt-PT")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
