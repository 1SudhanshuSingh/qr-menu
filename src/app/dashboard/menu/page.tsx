import { db } from "~/server/db";
import { MenuManager } from "./MenuManager";

export default async function MenuPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return <p>Restaurant not found.</p>;

  const categories = await db.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      dishes: {
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      },
    },
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Menu
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Create and manage categories, dishes, prices, translations and allergens.
        </p>
      </div>
      <MenuManager
        categories={categories}
        currency={restaurant.currency}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
