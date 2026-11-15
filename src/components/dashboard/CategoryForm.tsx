"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";

type Translation = { locale: string; name: string };

const LOCALES = [
  { code: "pt", label: "PT — Português" },
  { code: "en", label: "EN — English" },
  { code: "es", label: "ES — Español" },
  { code: "fr", label: "FR — Français" },
  { code: "de", label: "DE — Deutsch" },
];

type Props = {
  restaurantId: string;
  initial?: { categoryId: string; translations: Translation[]; sortOrder: number };
  onDone: () => void;
  onCancel: () => void;
};

export function CategoryForm({ restaurantId, initial, onDone, onCancel }: Props) {
  const isEdit = !!initial;

  const [names, setNames] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    LOCALES.forEach(({ code }) => { map[code] = ""; });
    initial?.translations.forEach((t) => { map[t.locale] = t.name; });
    return map;
  });
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [error, setError] = useState("");

  const create = api.dishes.createCategory.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });
  const update = api.dishes.updateCategory.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });

  const busy = create.isPending || update.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const translations = LOCALES
      .map(({ code }) => ({ locale: code, name: names[code] ?? "" }))
      .filter((t) => t.name.trim().length > 0);

    if (translations.length === 0) { setError("Enter a name in at least one language."); return; }

    if (isEdit && initial) {
      update.mutate({ categoryId: initial.categoryId, translations, sortOrder });
    } else {
      create.mutate({ restaurantId, translations, sortOrder });
    }
  }

  return (
    <Overlay onClose={onCancel}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#1C1917" }}>
            {isEdit ? "Edit category" : "New category"}
          </h2>
          <button type="button" onClick={onCancel} className="rounded-full p-1 opacity-40 hover:opacity-70">
            <X size={18} />
          </button>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
            Name (translations)
          </legend>
          {LOCALES.map(({ code, label }) => (
            <label key={code} className="flex items-center gap-3">
              <span className="w-28 flex-shrink-0 text-xs font-medium" style={{ color: "#78716C" }}>{label}</span>
              <input
                type="text"
                value={names[code] ?? ""}
                onChange={(e) => setNames((p) => ({ ...p, [code]: e.target.value }))}
                placeholder={code === "pt" ? "Nome da categoria (obrigatório)" : "Translation (optional)"}
                className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E8E0D8", color: "#1C1917", "--tw-ring-color": "#6B1D2A" } as React.CSSProperties}
              />
            </label>
          ))}
        </fieldset>

        <label className="flex items-center gap-3">
          <span className="w-28 flex-shrink-0 text-xs font-medium" style={{ color: "#78716C" }}>Sort order</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-24 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
          />
        </label>

        {error && <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>}

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
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center"
      style={{ background: "rgba(28,25,23,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{ background: "#FAF7F2" }}
      >
        {children}
      </div>
    </div>
  );
}
