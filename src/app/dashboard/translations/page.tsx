import { db } from "~/server/db";

export default async function TranslationsPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;

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

  const locales = restaurant.enabledLocales;
  const totalDishes = categories.flatMap((c) => c.dishes).length;
  const translatedDishes = categories.flatMap((c) =>
    c.dishes.filter((d) => d.translations.length >= locales.length),
  ).length;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
            Translations
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
            Menu content in all enabled languages.
          </p>
        </div>
        <div
          className="rounded-xl px-5 py-3 text-center"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          <p className="text-2xl font-bold tabular-nums" style={{ color: "#2D6A4F" }}>
            {translatedDishes}/{totalDishes}
          </p>
          <p className="text-xs" style={{ color: "#78716C" }}>fully translated</p>
        </div>
      </div>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="overflow-hidden rounded-2xl"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          {/* Category header */}
          <div
            className="px-5 py-3"
            style={{ background: "#F7F5F2", borderBottom: "1px solid #E8E0D8" }}
          >
            <div className="flex items-center gap-4">
              <p className="font-semibold" style={{ color: "#1A3A6C" }}>
                {cat.translations.find((t) => t.locale === "pt")?.name ?? "—"}
              </p>
              {locales.map((loc) => (
                <span
                  key={loc}
                  className="rounded px-2 py-0.5 text-xs font-semibold uppercase"
                  style={
                    cat.translations.find((t) => t.locale === loc)
                      ? { background: "#EBF5F0", color: "#2D6A4F" }
                      : { background: "#FEE2E2", color: "#DC2626" }
                  }
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Dishes */}
          {cat.dishes.map((dish, i) => {
            const pt = dish.translations.find((t) => t.locale === "pt");
            return (
              <div
                key={dish.id}
                className="flex items-center gap-4 px-5 py-3"
                style={{ borderTop: i > 0 ? "1px solid #F7F5F2" : "none" }}
              >
                <p className="flex-1 truncate text-sm" style={{ color: "#1C1917" }}>
                  {pt?.name ?? "—"}
                </p>
                <div className="flex gap-1.5">
                  {locales.map((loc) => {
                    const has = dish.translations.some((t) => t.locale === loc);
                    return (
                      <span
                        key={loc}
                        className="rounded px-2 py-0.5 text-xs font-medium uppercase"
                        style={
                          has
                            ? { background: "#EBF5F0", color: "#2D6A4F" }
                            : { background: "#FEF3E2", color: "#92400E" }
                        }
                        title={has ? `${loc.toUpperCase()} translated` : `${loc.toUpperCase()} missing`}
                      >
                        {loc}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <p className="rounded-xl p-4 text-sm" style={{ background: "#F0EBE3", color: "#78716C" }}>
        💡 Auto-translation via DeepL is coming soon. For now, translations are managed via the seed
        script or directly in the database via{" "}
        <code className="rounded px-1" style={{ background: "#E8E0D8" }}>
          pnpm db:studio
        </code>
        .
      </p>
    </div>
  );
}
