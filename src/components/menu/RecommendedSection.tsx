import Image from "next/image";
import { formatPrice } from "~/lib/format";

type DishTranslation = { locale: string; name: string; description?: string | null };
type Dish = {
  id: string;
  pricecents: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  translations: DishTranslation[];
};

function getT(translations: DishTranslation[], locale: string, fallback: string) {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === fallback)
  );
}

const SECTION_TITLE: Record<string, string> = {
  pt: "Sugestões do Chef",
  en: "Chef's Picks",
  es: "Sugerencias del Chef",
  fr: "Suggestions du Chef",
  de: "Empfehlungen des Küchenchefs",
};

export function RecommendedSection({
  dishes,
  locale,
  defaultLocale,
  currency,
}: {
  dishes: Dish[];
  locale: string;
  defaultLocale: string;
  currency: string;
}) {
  const featured = dishes.filter((d) => d.isFeatured && d.isAvailable);
  if (featured.length === 0) return null;

  const title = SECTION_TITLE[locale] ?? SECTION_TITLE.en!;

  return (
    <section className="pt-6">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3 px-4">
        <h2
          className="font-display text-xl font-semibold tracking-wide"
          style={{
            color: "var(--color-category)",
            fontFamily: "var(--font-display, Georgia), serif",
          }}
        >
          ✦ {title}
        </h2>
        <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
      </div>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-3"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {featured.map((dish) => {
          const tr = getT(dish.translations, locale, defaultLocale);
          return (
            <div
              key={dish.id}
              className="flex-shrink-0 w-40 overflow-hidden rounded-2xl shadow-sm"
              style={{ background: "var(--color-surface, #fff)" }}
            >
              {dish.imageUrl ? (
                <div className="relative h-28 w-full">
                  <Image
                    src={dish.imageUrl}
                    alt={tr?.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              ) : (
                <div
                  className="h-20 w-full"
                  style={{ background: "var(--color-line)" }}
                />
              )}
              <div className="p-3">
                <p
                  className="line-clamp-2 font-display text-sm font-semibold leading-tight"
                  style={{
                    fontFamily: "var(--font-display, Georgia), serif",
                    color: "var(--color-ink)",
                  }}
                >
                  {tr?.name}
                </p>
                <p
                  className="mt-1.5 font-display text-sm font-semibold tabular-nums"
                  style={{
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-display, Georgia), serif",
                  }}
                >
                  {formatPrice(dish.pricecents, locale, currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
