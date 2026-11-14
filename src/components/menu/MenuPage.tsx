"use client";

import {
  type Category,
  type CategoryTranslation,
  type Dish,
  type DishTranslation,
  type Restaurant,
} from "@prisma/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "~/navigation";
import { formatPrice } from "~/lib/format";
import { DietaryBadge } from "./DietaryBadge";
import { LanguageSplash } from "./LanguageSplash";
import { RecommendedSection } from "./RecommendedSection";
import { ReviewWidget } from "./ReviewWidget";

type DishWithT = Dish & { translations: DishTranslation[] };
type CategoryWithDishes = Category & {
  translations: CategoryTranslation[];
  dishes: DishWithT[];
};
type RestaurantWithMenu = Restaurant & { categories: CategoryWithDishes[] };

function getT<T extends { locale: string }>(
  items: T[],
  locale: string,
  fallback: string,
): T | undefined {
  return items.find((t) => t.locale === locale) ?? items.find((t) => t.locale === fallback);
}

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
];

export function MenuPage({
  restaurant,
  locale,
}: {
  restaurant: RestaurantWithMenu;
  locale: string;
}) {
  const t = useTranslations("menu");
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("");
  const catRefs = useRef<Map<string, HTMLElement>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);
  const theme = restaurant.theme as Record<string, string>;

  // Collect all available featured dishes across every category
  const allFeaturedDishes = restaurant.categories.flatMap((c) =>
    c.dishes.filter((d) => d.isFeatured && d.isAvailable),
  );

  const enabledLocales = LOCALES.filter((l) =>
    restaurant.enabledLocales.includes(l.code),
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 },
    );
    catRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!navRef.current || !activeId) return;
    navRef.current
      .querySelector(`[data-id="${activeId}"]`)
      ?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [activeId]);

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
  }

  return (
    <div
      className="min-h-screen"
      style={{
        "--color-bg": theme.colorBg ?? "#FAF7F2",
        "--color-surface": theme.colorSurface ?? "#FFFFFF",
        "--color-ink": theme.colorInk ?? "#1C1917",
        "--color-muted": theme.colorMuted ?? "#78716C",
        "--color-accent": theme.colorAccent ?? "#6B1D2A",
        "--color-accent-ink": theme.colorAccentInk ?? "#FAF7F2",
        "--color-line": theme.colorLine ?? "#E8DFD0",
        "--color-category": theme.colorCategory ?? "#1A3A6C",
        "--radius": theme.radius ?? "0.5rem",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
      } as React.CSSProperties}
    >
      {/* Language selection on first visit */}
      <LanguageSplash
        enabledLocales={restaurant.enabledLocales}
        currentLocale={locale}
        slug={restaurant.slug}
        restaurantName={restaurant.name}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Azulejo SVG background */}
        <div className="absolute inset-0" style={{ background: "var(--color-category)" }}>
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.12]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="azulejo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect width="60" height="60" fill="none" />
                <rect x="2" y="2" width="56" height="56" fill="none" stroke="white" strokeWidth="1" />
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="white" strokeWidth="0.8" />
                <circle cx="30" cy="30" r="12" fill="none" stroke="white" strokeWidth="0.8" />
                <line x1="2" y1="2" x2="10" y2="10" stroke="white" strokeWidth="0.6" />
                <line x1="58" y1="2" x2="50" y2="10" stroke="white" strokeWidth="0.6" />
                <line x1="2" y1="58" x2="10" y2="50" stroke="white" strokeWidth="0.6" />
                <line x1="58" y1="58" x2="50" y2="50" stroke="white" strokeWidth="0.6" />
                <circle cx="30" cy="30" r="3" fill="white" opacity="0.4" />
                <circle cx="2" cy="2" r="2" fill="white" opacity="0.4" />
                <circle cx="58" cy="2" r="2" fill="white" opacity="0.4" />
                <circle cx="2" cy="58" r="2" fill="white" opacity="0.4" />
                <circle cx="58" cy="58" r="2" fill="white" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#azulejo)" />
          </svg>
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--color-category))",
            }}
          />
        </div>

        {/* Language switcher — top right */}
        {enabledLocales.length > 1 && (
          <div className="absolute right-4 top-4 z-10 flex gap-1">
            {enabledLocales.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                aria-pressed={locale === code}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-widest transition-all ${
                  locale === code
                    ? "bg-white/20 text-white ring-1 ring-white/40"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Logo / name */}
        <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 pb-10 pt-14 text-center text-white">
          {restaurant.logoUrl ? (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={120}
              height={60}
              className="mb-4 object-contain"
            />
          ) : (
            <h1
              className="font-display text-4xl font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display, Georgia), serif" }}
            >
              {restaurant.name}
            </h1>
          )}
          {restaurant.tagline && (
            <p
              className="mt-2 font-display text-sm italic text-white/70"
              style={{ fontFamily: "var(--font-display, Georgia), serif" }}
            >
              {restaurant.tagline}
            </p>
          )}
        </div>
      </header>

      {/* ── Sticky category nav ───────────────────────────────── */}
      <div
        ref={navRef}
        className="sticky top-0 z-20 overflow-x-auto"
        style={{
          background: "rgba(250,247,242,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        <div className="flex gap-1 px-3 py-2.5">
          {restaurant.categories.map((cat) => {
            const name = getT(cat.translations, locale, restaurant.defaultLocale)?.name ?? "";
            const id = `cat-${cat.id}`;
            const isActive = activeId === id;
            return (
              <button
                key={cat.id}
                data-id={id}
                onClick={() => {
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-[var(--color-accent-ink)] shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
                style={
                  isActive
                    ? { background: "var(--color-accent)", color: "var(--color-accent-ink)" }
                    : {}
                }
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recommended dishes ───────────────────────────────── */}
      {allFeaturedDishes.length > 0 && (
        <div className="mx-auto max-w-xl">
          <RecommendedSection
            dishes={allFeaturedDishes}
            locale={locale}
            defaultLocale={restaurant.defaultLocale}
            currency={restaurant.currency}
          />
        </div>
      )}

      {/* ── Menu content ─────────────────────────────────────── */}
      <main className="mx-auto max-w-xl px-4 pb-24 pt-2">
        {restaurant.categories.map((cat) => {
          const catName = getT(cat.translations, locale, restaurant.defaultLocale)?.name ?? "";
          const id = `cat-${cat.id}`;
          return (
            <section
              key={cat.id}
              id={id}
              ref={(el) => { if (el) catRefs.current.set(id, el); }}
              className="pt-10"
            >
              {/* Category header */}
              <div className="mb-1 flex items-center gap-3">
                <h2
                  className="font-display text-2xl font-semibold tracking-wide"
                  style={{
                    color: "var(--color-category)",
                    fontFamily: "var(--font-display, Georgia), serif",
                  }}
                >
                  {catName}
                </h2>
                <div className="h-px flex-1" style={{ background: "var(--color-line)" }} />
              </div>

              {/* Dish list */}
              <div className="mt-3 space-y-0">
                {cat.dishes.map((dish, i) => {
                  const tr = getT(dish.translations, locale, restaurant.defaultLocale);
                  return (
                    <DishItem
                      key={dish.id}
                      name={tr?.name ?? ""}
                      description={tr?.description ?? undefined}
                      pricecents={dish.pricecents}
                      locale={locale}
                      currency={restaurant.currency}
                      isAvailable={dish.isAvailable}
                      dietaryTags={dish.dietaryTags}
                      imageUrl={dish.imageUrl ?? undefined}
                      soldOutLabel={t("soldOut")}
                      isLast={i === cat.dishes.length - 1}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Google review nudge */}
        {restaurant.googleReviewUrl && (
          <div
            className="mt-14 overflow-hidden rounded-2xl"
            style={{ background: "var(--color-category)" }}
          >
            <div className="relative p-6 text-center text-white">
              <svg
                className="absolute inset-0 h-full w-full opacity-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="az2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="1" />
                    <rect x="1" y="1" width="38" height="38" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#az2)" />
              </svg>
              <div className="relative">
                <p
                  className="font-display text-lg italic"
                  style={{ fontFamily: "var(--font-display, Georgia), serif" }}
                >
                  {t("review.cta")}
                </p>
                <a
                  href={restaurant.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-full bg-white px-6 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ color: "var(--color-category)" }}
                >
                  {t("review.button")}
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Floating review button + popup ───────────────────── */}
      <ReviewWidget
        restaurantId={restaurant.id}
        googleReviewUrl={restaurant.googleReviewUrl ?? null}
        locale={locale}
      />

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="border-t px-4 py-10 text-center text-sm"
        style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
      >
        <div className="mx-auto max-w-xl space-y-1">
          <p
            className="font-display text-base font-medium"
            style={{
              color: "var(--color-ink)",
              fontFamily: "var(--font-display, Georgia), serif",
            }}
          >
            {restaurant.name}
          </p>
          {restaurant.address && <p>{restaurant.address}</p>}
          {restaurant.phone && <p>{restaurant.phone}</p>}
          {restaurant.instagramHandle && (
            <p>
              <a
                href={`https://instagram.com/${restaurant.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @{restaurant.instagramHandle}
              </a>
            </p>
          )}
          <p className="pt-3 text-xs opacity-50">
            Preços incluem IVA · Informe-nos sobre alergénios
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Individual dish item ────────────────────────────────────

function DishItem({
  name,
  description,
  pricecents,
  locale,
  currency,
  isAvailable,
  dietaryTags,
  imageUrl,
  soldOutLabel,
  isLast,
}: {
  name: string;
  description?: string;
  pricecents: number;
  locale: string;
  currency: string;
  isAvailable: boolean;
  dietaryTags: string[];
  imageUrl?: string;
  soldOutLabel: string;
  isLast: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 py-4 transition-opacity ${!isAvailable ? "opacity-40" : ""} ${
        !isLast ? "border-b" : ""
      }`}
      style={{ borderColor: "var(--color-line)" }}
    >
      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span
              className="block font-display text-[1.08rem] font-medium leading-snug"
              style={{
                color: "var(--color-ink)",
                fontFamily: "var(--font-display, Georgia), serif",
              }}
            >
              {name}
            </span>
            {description && (
              <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {description}
              </p>
            )}
          </div>
          {/* Price */}
          <span
            className="mt-0.5 flex-shrink-0 font-display text-[1.05rem] font-semibold tabular-nums"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-display, Georgia), serif",
            }}
          >
            {formatPrice(pricecents, locale, currency)}
          </span>
        </div>

        {/* Tags */}
        {(dietaryTags.length > 0 || !isAvailable) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {dietaryTags.map((tag) => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
            {!isAvailable && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: "var(--color-line)",
                  color: "var(--color-muted)",
                }}
              >
                {soldOutLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Photo thumbnail */}
      {imageUrl && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
    </div>
  );
}
