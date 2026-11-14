"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
];

const ALLERGENS: { code: string; label: string }[] = [
  { code: "GLUTEN",      label: "Gluten" },
  { code: "CRUSTACEANS", label: "Crustaceans" },
  { code: "EGGS",        label: "Eggs" },
  { code: "FISH",        label: "Fish" },
  { code: "PEANUTS",     label: "Peanuts" },
  { code: "SOYBEANS",    label: "Soybeans" },
  { code: "MILK",        label: "Milk" },
  { code: "NUTS",        label: "Nuts" },
  { code: "CELERY",      label: "Celery" },
  { code: "MUSTARD",     label: "Mustard" },
  { code: "SESAME",      label: "Sesame" },
  { code: "SULPHITES",   label: "Sulphites" },
  { code: "LUPIN",       label: "Lupin" },
  { code: "MOLLUSCS",    label: "Molluscs" },
];

const DIETARY: { code: string; label: string }[] = [
  { code: "VEGAN",       label: "Vegan" },
  { code: "VEGETARIAN",  label: "Vegetarian" },
  { code: "BEEF",        label: "Beef" },
  { code: "PORK",        label: "Pork" },
  { code: "CHICKEN",     label: "Chicken" },
  { code: "FISH",        label: "Fish" },
  { code: "SEAFOOD",     label: "Seafood" },
];

type TranslationField = { name: string; description: string };
type Initial = {
  dishId: string;
  categoryId: string;
  pricecents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isSpecial: boolean;
  allergens: string[];
  dietaryTags: string[];
  sortOrder: number;
  translations: { locale: string; name: string; description?: string | null }[];
};

type Props = {
  categoryId: string;
  categories: { id: string; name: string }[];
  initial?: Initial;
  onDone: () => void;
  onCancel: () => void;
};

export function DishForm({ categoryId: defaultCategoryId, categories, initial, onDone, onCancel }: Props) {
  const isEdit = !!initial;

  const initTranslations = (): Record<string, TranslationField> => {
    const map: Record<string, TranslationField> = {};
    LOCALES.forEach(({ code }) => { map[code] = { name: "", description: "" }; });
    initial?.translations.forEach((t) => {
      map[t.locale] = { name: t.name, description: t.description ?? "" };
    });
    return map;
  };

  const [catId, setCatId] = useState(initial?.categoryId ?? defaultCategoryId);
  const [price, setPrice] = useState(initial ? (initial.pricecents / 100).toFixed(2) : "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isSpecial, setIsSpecial] = useState(initial?.isSpecial ?? false);
  const [allergens, setAllergens] = useState<Set<string>>(new Set(initial?.allergens ?? []));
  const [dietary, setDietary] = useState<Set<string>>(new Set(initial?.dietaryTags ?? []));
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [translations, setTranslations] = useState<Record<string, TranslationField>>(initTranslations);
  const [error, setError] = useState("");

  const create = api.dishes.createDish.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });
  const update = api.dishes.updateDish.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });
  const busy = create.isPending || update.isPending;

  function toggleSet(set: Set<string>, setFn: (s: Set<string>) => void, code: string) {
    const next = new Set(set);
    if (next.has(code)) { next.delete(code); } else { next.add(code); }
    setFn(next);
  }

  function setField(locale: string, field: keyof TranslationField, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale]!, [field]: value } }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const ptName = translations.pt?.name.trim();
    if (!ptName) { setError("Portuguese name is required."); return; }

    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents < 0) { setError("Enter a valid price."); return; }

    const translationsList = LOCALES
      .map(({ code }) => ({
        locale: code,
        name: translations[code]?.name.trim() ?? "",
        description: translations[code]?.description.trim() !== "" ? translations[code]?.description.trim() : undefined,
      }))
      .filter((t) => t.name.length > 0);

    const payload = {
      categoryId: catId,
      pricecents: priceCents,
      imageUrl: imageUrl.trim() || undefined,
      isAvailable,
      isFeatured,
      isSpecial,
      allergens: [...allergens],
      dietaryTags: [...dietary],
      sortOrder,
      translations: translationsList,
    };

    if (isEdit && initial) {
      update.mutate({ dishId: initial.dishId, ...payload });
    } else {
      create.mutate(payload);
    }
  }

  return (
    <Overlay onClose={onCancel}>
      <form onSubmit={submit} className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#1C1917" }}>
            {isEdit ? "Edit dish" : "New dish"}
          </h2>
          <button type="button" onClick={onCancel} className="rounded-full p-1 opacity-40 hover:opacity-70">
            <X size={18} />
          </button>
        </div>

        {/* Category */}
        <Field label="Category">
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#E8E0D8", color: "#1C1917", background: "white" }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        {/* Translations */}
        <section>
          <SectionLabel>Name &amp; description</SectionLabel>
          <div className="mt-2 overflow-hidden rounded-xl border" style={{ borderColor: "#E8E0D8" }}>
            {LOCALES.map(({ code, label }, i) => (
              <div
                key={code}
                className="grid grid-cols-[48px_1fr_1fr] gap-0"
                style={{ borderTop: i > 0 ? "1px solid #F0EBE3" : "none" }}
              >
                <div
                  className="flex items-start justify-center pt-3 text-xs font-semibold"
                  style={{ color: "#A8A29E", borderRight: "1px solid #F0EBE3" }}
                >
                  {label}
                </div>
                <input
                  type="text"
                  value={translations[code]?.name ?? ""}
                  onChange={(e) => setField(code, "name", e.target.value)}
                  placeholder={code === "pt" ? "Nome *" : "Name"}
                  className="border-r px-3 py-2.5 text-sm focus:outline-none focus:bg-amber-50/30"
                  style={{ borderColor: "#F0EBE3", color: "#1C1917" }}
                />
                <input
                  type="text"
                  value={translations[code]?.description ?? ""}
                  onChange={(e) => setField(code, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="px-3 py-2.5 text-sm focus:outline-none focus:bg-amber-50/30"
                  style={{ color: "#1C1917" }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Price + Sort + Image */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (€) *">
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
            />
          </Field>
        </div>

        <Field label="Image URL">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
          />
        </Field>

        {/* Flags */}
        <section>
          <SectionLabel>Status</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              { key: "isAvailable", label: "Available",   val: isAvailable, set: setIsAvailable, on: "#2D6A4F", off: "#DC2626" },
              { key: "isFeatured",  label: "Chef's Pick", val: isFeatured,  set: setIsFeatured,  on: "#6B1D2A", off: "#A8A29E" },
              { key: "isSpecial",   label: "Special",     val: isSpecial,   set: setIsSpecial,   on: "#92400E", off: "#A8A29E" },
            ] as const).map(({ key, label, val, set, on, off }) => (
              <button
                key={key}
                type="button"
                onClick={() => set(!val)}
                className="rounded-full px-4 py-2 text-xs font-semibold transition-all"
                style={{ background: val ? `${on}18` : "#F0EBE3", color: val ? on : "#A8A29E", border: `1.5px solid ${val ? on : "transparent"}` }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Allergens */}
        <section>
          <SectionLabel>Allergens (EU 1169/2011)</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ALLERGENS.map(({ code, label }) => {
              const on = allergens.has(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleSet(allergens, setAllergens, code)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: on ? "#1C191718" : "#F7F5F2",
                    color: on ? "#1C1917" : "#A8A29E",
                    border: `1.5px solid ${on ? "#1C1917" : "transparent"}`,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dietary tags */}
        <section>
          <SectionLabel>Dietary tags</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DIETARY.map(({ code, label }) => {
              const on = dietary.has(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleSet(dietary, setDietary, code)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: on ? "#2D6A4F18" : "#F7F5F2",
                    color: on ? "#2D6A4F" : "#A8A29E",
                    border: `1.5px solid ${on ? "#2D6A4F" : "transparent"}`,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {error && <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: "#F0EBE3", color: "#78716C" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#1C1917" }}
          >
            {busy ? "Saving…" : isEdit ? "Save changes" : "Add dish"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium" style={{ color: "#78716C" }}>{label}</span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
      {children}
    </p>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-4 py-8"
      style={{ background: "rgba(28,25,23,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="mx-auto w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
        style={{ background: "#FAF7F2" }}
      >
        {children}
      </div>
    </div>
  );
}
