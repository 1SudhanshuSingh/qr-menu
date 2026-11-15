"use client";

import { useState } from "react";
import {
  type Category,
  type CategoryTranslation,
  type Dish,
  type DishTranslation,
} from "@prisma/client";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import { formatPrice } from "~/lib/format";
import { CategoryForm } from "~/components/dashboard/CategoryForm";
import { DishForm } from "~/components/dashboard/DishForm";

type DishWithT = Dish & { translations: DishTranslation[] };
type CategoryWithDishes = Category & { translations: CategoryTranslation[]; dishes: DishWithT[] };

function getNamePt(translations: { locale: string; name: string }[]) {
  return (
    translations.find((t) => t.locale === "pt")?.name ??
    translations.find((t) => t.locale === "en")?.name ??
    "—"
  );
}

type Modal =
  | { type: "new-category" }
  | { type: "edit-category"; category: CategoryWithDishes }
  | { type: "new-dish"; categoryId: string }
  | { type: "edit-dish"; dish: DishWithT; categoryId: string }
  | null;

export function MenuManager({
  categories: initial,
  currency,
  restaurantId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  currency: string;
  restaurantId: string;
}) {
  const [categories, setCategories] = useState<CategoryWithDishes[]>(initial as CategoryWithDishes[]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initial.map((c: CategoryWithDishes) => c.id)));
  const [modal, setModal] = useState<Modal>(null);

  const utils = api.useUtils();

  async function refresh() {
    const updated = await utils.dishes.listByRestaurant.fetch({ restaurantId });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setCategories(updated);
    setModal(null);
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const categoryList = categories.map((c) => ({
    id: c.id,
    name: getNamePt(c.translations),
  }));

  return (
    <>
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: "#78716C" }}>
          {categories.length} {categories.length === 1 ? "category" : "categories"} ·{" "}
          {categories.reduce((s, c) => s + c.dishes.length, 0)} dishes
        </p>
        <button
          onClick={() => setModal({ type: "new-category" })}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1C1917" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New category
        </button>
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {categories.length === 0 && (
          <div
            className="rounded-2xl px-6 py-14 text-center"
            style={{ background: "white", border: "1px dashed #D6CEC7" }}
          >
            <p className="font-medium" style={{ color: "#1C1917" }}>No categories yet</p>
            <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
              Start by creating your first category, then add dishes to it.
            </p>
            <button
              onClick={() => setModal({ type: "new-category" })}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "#1C1917" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Create first category
            </button>
          </div>
        )}

        {categories.map((cat) => (
          <CategoryBlock
            key={cat.id}
            category={cat}
            currency={currency}
            isExpanded={expanded.has(cat.id)}
            onToggleExpand={() => toggleExpanded(cat.id)}
            onEditCategory={() => setModal({ type: "edit-category", category: cat })}
            onNewDish={() => setModal({ type: "new-dish", categoryId: cat.id })}
            onEditDish={(dish) => setModal({ type: "edit-dish", dish, categoryId: cat.id })}
            onDelete={refresh}
          />
        ))}
      </div>

      {/* Modals */}
      {modal?.type === "new-category" && (
        <CategoryForm
          restaurantId={restaurantId}
          onDone={refresh}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "edit-category" && (
        <CategoryForm
          restaurantId={restaurantId}
          initial={{
            categoryId: modal.category.id,
            translations: modal.category.translations,
            sortOrder: modal.category.sortOrder,
          }}
          onDone={refresh}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "new-dish" && (
        <DishForm
          categoryId={modal.categoryId}
          categories={categoryList}
          onDone={refresh}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "edit-dish" && (
        <DishForm
          categoryId={modal.categoryId}
          categories={categoryList}
          initial={{
            dishId: modal.dish.id,
            categoryId: modal.categoryId,
            pricecents: modal.dish.pricecents,
            imageUrl: modal.dish.imageUrl,
            isAvailable: modal.dish.isAvailable,
            isFeatured: modal.dish.isFeatured,
            isSpecial: modal.dish.isSpecial,
            allergens: modal.dish.allergens as unknown as string[],
            dietaryTags: modal.dish.dietaryTags as unknown as string[],
            sortOrder: modal.dish.sortOrder,
            translations: modal.dish.translations,
          }}
          onDone={refresh}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}

// ── Category block ────────────────────────────────────────────

function CategoryBlock({
  category,
  currency,
  isExpanded,
  onToggleExpand,
  onEditCategory,
  onNewDish,
  onEditDish,
  onDelete,
}: {
  category: CategoryWithDishes;
  currency: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditCategory: () => void;
  onNewDish: () => void;
  onEditDish: (dish: DishWithT) => void;
  onDelete: () => void;
}) {
  const [visible, setVisible] = useState(category.isVisible);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleVisible = api.dishes.toggleCategoryVisible.useMutation({
    onSuccess: (d) => setVisible(d.isVisible),
  });
  const deleteCategory = api.dishes.deleteCategory.useMutation({ onSuccess: onDelete });

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "white", border: "1px solid #E8E0D8" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: isExpanded ? "1px solid #F0EBE3" : "none" }}
      >
        <button onClick={onToggleExpand} className="flex flex-1 items-center gap-2 text-left">
          <span className="text-xs" style={{ color: "#A8A29E" }}>{isExpanded ? "▾" : "▸"}</span>
          <span className="font-semibold" style={{ color: "#1C1917" }}>
            {getNamePt(category.translations)}
          </span>
          <span className="text-xs" style={{ color: "#A8A29E" }}>({category.dishes.length})</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleVisible.mutate({ categoryId: category.id, isVisible: !visible })}
            className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
            style={visible
              ? { background: "#EBF5F0", color: "#2D6A4F" }
              : { background: "#F5F5F4", color: "#A8A29E" }}
          >
            {visible ? "Visible" : "Hidden"}
          </button>
          <IconBtn onClick={onEditCategory} title="Edit category"><Edit2 size={13} /></IconBtn>
          <IconBtn onClick={onNewDish} title="Add dish" accent><Plus size={14} strokeWidth={2.5} /></IconBtn>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => deleteCategory.mutate({ categoryId: category.id })}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-white"
                style={{ background: "#DC2626" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-2 py-1 text-xs"
                style={{ color: "#78716C" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <IconBtn onClick={() => setConfirmDelete(true)} title="Delete category" danger>
              <Trash2 size={13} />
            </IconBtn>
          )}
        </div>
      </div>

      {/* Dishes */}
      {isExpanded && (
        <div>
          {category.dishes.map((dish, i) => (
            <DishRow
              key={dish.id}
              dish={dish}
              currency={currency}
              isLast={i === category.dishes.length - 1}
              onEdit={() => onEditDish(dish)}
              onDelete={onDelete}
            />
          ))}
          {category.dishes.length === 0 && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm" style={{ color: "#A8A29E" }}>No dishes yet.</p>
              <button
                onClick={onNewDish}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ background: "#F0EBE3", color: "#6B1D2A" }}
              >
                <Plus size={12} strokeWidth={2.5} />
                Add first dish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dish row ──────────────────────────────────────────────────

function DishRow({
  dish,
  currency,
  isLast,
  onEdit,
  onDelete,
}: {
  dish: DishWithT;
  currency: string;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [available, setAvailable] = useState(dish.isAvailable);
  const [featured, setFeatured] = useState(dish.isFeatured);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleAvailable = api.dishes.toggleAvailable.useMutation({ onSuccess: (d) => setAvailable(d.isAvailable) });
  const toggleFeatured  = api.dishes.toggleFeatured.useMutation({  onSuccess: (d) => setFeatured(d.isFeatured) });
  const deleteDish      = api.dishes.deleteDish.useMutation({ onSuccess: onDelete });

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: !isLast ? "1px solid #F7F5F2" : "none", opacity: available ? 1 : 0.6 }}
    >
      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "#1C1917" }}>
          {getNamePt(dish.translations)}
        </p>
        {!available && (
          <span className="text-xs" style={{ color: "#DC2626" }}>Sold out</span>
        )}
        {dish.allergens.length > 0 && (
          <p className="mt-0.5 text-xs" style={{ color: "#A8A29E" }}>
            {dish.allergens.slice(0, 4).join(", ").toLowerCase()}
            {dish.allergens.length > 4 ? ` +${dish.allergens.length - 4}` : ""}
          </p>
        )}
      </div>

      {/* Price */}
      <span className="tabular-nums text-sm font-medium" style={{ color: "#6B1D2A" }}>
        {formatPrice(dish.pricecents, "pt", currency)}
      </span>

      {/* Featured star */}
      <button
        onClick={() => toggleFeatured.mutate({ dishId: dish.id, isFeatured: !featured })}
        title={featured ? "Remove from Chef's Picks" : "Add to Chef's Picks"}
        className="transition-opacity hover:opacity-80"
        style={{ color: featured ? "#6B1D2A" : "#D6CBBF" }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M8 1l1.76 3.56 3.94.57-2.85 2.78.67 3.92L8 9.9l-3.52 1.85.67-3.92L2.3 5.13l3.94-.57z"/>
        </svg>
      </button>

      {/* Available */}
      <button
        onClick={() => toggleAvailable.mutate({ dishId: dish.id, isAvailable: !available })}
        className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
        style={available
          ? { background: "#EBF5F0", color: "#2D6A4F" }
          : { background: "#FEE2E2", color: "#DC2626" }}
      >
        {available ? "In" : "Out"}
      </button>

      {/* Edit */}
      <IconBtn onClick={onEdit} title="Edit dish"><Edit2 size={13} /></IconBtn>

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteDish.mutate({ dishId: dish.id })}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-white"
            style={{ background: "#DC2626" }}
          >
            Del
          </button>
          <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-2 py-1 text-xs" style={{ color: "#78716C" }}>
            ×
          </button>
        </div>
      ) : (
        <IconBtn onClick={() => setConfirmDelete(true)} title="Delete dish" danger>
          <Trash2 size={13} />
        </IconBtn>
      )}
    </div>
  );
}

// ── Small icon button ─────────────────────────────────────────

function IconBtn({
  children,
  onClick,
  title,
  accent,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const color = accent ? "#6B1D2A" : danger ? "#DC2626" : "#78716C";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
      style={{ color }}
    >
      {children}
    </button>
  );
}
