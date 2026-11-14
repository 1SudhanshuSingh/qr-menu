"use client";

import { useState } from "react";
import { type Category, type CategoryTranslation, type Dish, type DishTranslation } from "@prisma/client";
import { api } from "~/trpc/react";
import { formatPrice } from "~/lib/format";

type DishWithT = Dish & { translations: DishTranslation[] };
type CategoryWithDishes = Category & { translations: CategoryTranslation[]; dishes: DishWithT[] };

function getName(translations: { locale: string; name: string }[], fallback = "—") {
  return translations.find((t) => t.locale === "pt")?.name ??
    translations.find((t) => t.locale === "en")?.name ??
    fallback;
}

export function MenuManager({
  categories,
  currency,
}: {
  categories: CategoryWithDishes[];
  currency: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.id)),
  );

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="overflow-hidden rounded-2xl"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          {/* Category header */}
          <CategoryHeader
            category={cat}
            isExpanded={expanded.has(cat.id)}
            onToggle={() => toggle(cat.id)}
          />

          {/* Dishes */}
          {expanded.has(cat.id) && (
            <div>
              {cat.dishes.map((dish, i) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  currency={currency}
                  isLast={i === cat.dishes.length - 1}
                />
              ))}
              {cat.dishes.length === 0 && (
                <p className="px-5 py-4 text-sm" style={{ color: "#A8A29E" }}>
                  No dishes in this category.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Category header with visibility toggle ──────────────────

function CategoryHeader({
  category,
  isExpanded,
  onToggle,
}: {
  category: CategoryWithDishes;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [visible, setVisible] = useState(category.isVisible);
  const toggleVisible = api.dishes.toggleCategoryVisible.useMutation({
    onSuccess: (d) => setVisible(d.isVisible),
  });

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: isExpanded ? "1px solid #F0EBE3" : "none" }}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-left"
      >
        <span className="text-sm" style={{ color: "#A8A29E" }}>
          {isExpanded ? "▾" : "▸"}
        </span>
        <span className="font-semibold" style={{ color: "#1C1917" }}>
          {getName(category.translations)}
        </span>
        <span className="text-xs" style={{ color: "#A8A29E" }}>
          ({category.dishes.length})
        </span>
      </button>

      <button
        onClick={() => toggleVisible.mutate({ categoryId: category.id, isVisible: !visible })}
        className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
        style={
          visible
            ? { background: "#EBF5F0", color: "#2D6A4F" }
            : { background: "#F5F5F4", color: "#A8A29E" }
        }
      >
        {visible ? "Visible" : "Hidden"}
      </button>
    </div>
  );
}

// ── Individual dish row ──────────────────────────────────────

function DishRow({
  dish,
  currency,
  isLast,
}: {
  dish: DishWithT;
  currency: string;
  isLast: boolean;
}) {
  const [available, setAvailable] = useState(dish.isAvailable);
  const [featured, setFeatured] = useState(dish.isFeatured);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState((dish.pricecents / 100).toFixed(2));

  const toggleAvailable = api.dishes.toggleAvailable.useMutation({
    onSuccess: (d) => setAvailable(d.isAvailable),
  });
  const toggleFeatured = api.dishes.toggleFeatured.useMutation({
    onSuccess: (d) => setFeatured(d.isFeatured),
  });
  const updatePrice = api.dishes.updatePrice.useMutation({
    onSuccess: () => setEditingPrice(false),
  });

  function savePrice() {
    const cents = Math.round(parseFloat(priceInput) * 100);
    if (!isNaN(cents) && cents >= 0) {
      updatePrice.mutate({ dishId: dish.id, pricecents: cents });
    }
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-3"
      style={{
        borderBottom: !isLast ? "1px solid #F7F5F2" : "none",
        opacity: available ? 1 : 0.55,
      }}
    >
      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "#1C1917" }}>
          {getName(dish.translations)}
        </p>
        {!available && (
          <span className="text-xs" style={{ color: "#DC2626" }}>
            Sold out
          </span>
        )}
      </div>

      {/* Price */}
      {editingPrice ? (
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ color: "#78716C" }}>€</span>
          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onBlur={savePrice}
            onKeyDown={(e) => { if (e.key === "Enter") savePrice(); if (e.key === "Escape") setEditingPrice(false); }}
            className="w-16 rounded border px-2 py-1 text-right text-sm focus:outline-none"
            style={{ borderColor: "#6B1D2A", color: "#1C1917" }}
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setEditingPrice(true)}
          className="rounded px-2 py-0.5 text-sm font-medium tabular-nums transition-colors hover:bg-orange-50"
          style={{ color: "#6B1D2A" }}
          title="Click to edit price"
        >
          {formatPrice(dish.pricecents, "pt", currency)}
        </button>
      )}

      {/* Featured toggle */}
      <button
        onClick={() => toggleFeatured.mutate({ dishId: dish.id, isFeatured: !featured })}
        title={featured ? "Remove from Chef's Picks" : "Add to Chef's Picks"}
        className="text-lg transition-opacity hover:opacity-80"
        style={{ opacity: featured ? 1 : 0.25 }}
      >
        ✦
      </button>

      {/* Available toggle */}
      <button
        onClick={() => toggleAvailable.mutate({ dishId: dish.id, isAvailable: !available })}
        className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        style={
          available
            ? { background: "#EBF5F0", color: "#2D6A4F" }
            : { background: "#FEE2E2", color: "#DC2626" }
        }
      >
        {available ? "Available" : "Sold out"}
      </button>
    </div>
  );
}
