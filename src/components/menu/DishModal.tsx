"use client";

import Image from "next/image";
import { type Dish, type DishTranslation } from "@prisma/client";
import { formatPrice } from "~/lib/format";
import { DietaryBadge } from "./DietaryBadge";

type DishWithT = Dish & { translations: DishTranslation[] };

function getT(translations: DishTranslation[], locale: string, fallback: string) {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === fallback)
  );
}

const ALLERGEN_ICONS: Record<string, string> = {
  GLUTEN: "🌾", CRUSTACEANS: "🦐", EGGS: "🥚", FISH: "🐟",
  PEANUTS: "🥜", SOYBEANS: "🫘", MILK: "🥛", NUTS: "🌰",
  CELERY: "🥬", MUSTARD: "🌿", SESAME: "⚫", SULPHITES: "🍷",
  LUPIN: "🌼", MOLLUSCS: "🐚",
};

const ALLERGEN_LABELS: Record<string, string> = {
  GLUTEN: "Glúten", CRUSTACEANS: "Crustáceos", EGGS: "Ovos", FISH: "Peixe",
  PEANUTS: "Amendoins", SOYBEANS: "Soja", MILK: "Leite", NUTS: "Frutos secos",
  CELERY: "Aipo", MUSTARD: "Mostarda", SESAME: "Sésamo", SULPHITES: "Sulfitos",
  LUPIN: "Tremoço", MOLLUSCS: "Moluscos",
};

export function DishModal({
  dish,
  locale,
  defaultLocale,
  currency,
  onClose,
}: {
  dish: DishWithT;
  locale: string;
  defaultLocale: string;
  currency: string;
  onClose: () => void;
}) {
  const tr = getT(dish.translations, locale, defaultLocale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(28,25,23,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-t-3xl sm:rounded-3xl"
        style={{ background: "#FAF7F2", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Photo */}
        {dish.imageUrl && (
          <div className="relative h-56 w-full">
            <Image
              src={dish.imageUrl}
              alt={tr?.name ?? ""}
              fill
              className="object-cover"
              sizes="400px"
            />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "rgba(28,25,23,0.6)", color: "white" }}
            >
              ×
            </button>
          </div>
        )}

        <div className="p-5">
          {/* Close button when no photo */}
          {!dish.imageUrl && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={onClose}
                className="text-2xl opacity-40 hover:opacity-70"
                style={{ color: "var(--color-ink)" }}
              >
                ×
              </button>
            </div>
          )}

          {/* Name + price */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className="font-display text-2xl font-semibold leading-tight"
              style={{
                fontFamily: "var(--font-display, Georgia), serif",
                color: "var(--color-ink)",
              }}
            >
              {tr?.name}
            </h3>
            <span
              className="mt-1 flex-shrink-0 font-display text-xl font-semibold tabular-nums"
              style={{
                fontFamily: "var(--font-display, Georgia), serif",
                color: "var(--color-accent)",
              }}
            >
              {formatPrice(dish.pricecents, locale, currency)}
            </span>
          </div>

          {/* Description */}
          {tr?.description && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {tr.description}
            </p>
          )}

          {/* Dietary tags */}
          {dish.dietaryTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {dish.dietaryTags.map((tag) => (
                <DietaryBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Allergens */}
          {dish.allergens.length > 0 && (
            <div className="mt-5">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                Alergénios
              </p>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{ background: "#FEF3C7", color: "#92400E" }}
                  >
                    <span>{ALLERGEN_ICONS[a] ?? "⚠️"}</span>
                    <span>{ALLERGEN_LABELS[a] ?? a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sold out */}
          {!dish.isAvailable && (
            <div
              className="mt-4 rounded-xl px-4 py-2.5 text-center text-sm font-medium"
              style={{ background: "var(--color-line)", color: "var(--color-muted)" }}
            >
              Esgotado — Sold out
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
