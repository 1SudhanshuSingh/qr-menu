import { db } from "~/server/db";
import { TableManager } from "./TableManager";
import { env } from "~/env";

export default async function TablesPage() {
  const restaurant = await db.restaurant.findFirst({
    where: { slug: "alma-portuguesa" },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  if (!restaurant) return <p>Restaurant not found.</p>;

  const tables = await db.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: "asc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Tables &amp; QR Standees
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Each table gets a unique QR code that pre-fills the table number for waiter calls.
          Design a print-ready standee for every table.
        </p>
      </div>
      <TableManager
        initialTables={tables}
        restaurant={restaurant}
        appUrl={env.NEXT_PUBLIC_APP_URL}
      />
    </div>
  );
}
