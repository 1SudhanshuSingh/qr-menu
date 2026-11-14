import { db } from "~/server/db";
import { LiveCallsBoard } from "./LiveCallsBoard";

export default async function CallsPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;

  const activeCalls = await db.waiterCall.findMany({
    where: { restaurantId: restaurant.id, resolved: false },
    orderBy: { createdAt: "asc" },
  });

  const resolvedToday = await db.waiterCall.count({
    where: {
      restaurantId: restaurant.id,
      resolved: true,
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
            Live Table Calls
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
            Requests from customers — auto-refreshes every 15 seconds.
          </p>
        </div>
        <div
          className="rounded-xl px-4 py-2 text-center"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          <p className="text-2xl font-bold tabular-nums" style={{ color: "#2D6A4F" }}>
            {resolvedToday}
          </p>
          <p className="text-xs" style={{ color: "#78716C" }}>Resolved today</p>
        </div>
      </div>

      <LiveCallsBoard
        initialCalls={activeCalls}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
