"use client";

import { useState } from "react";

const ALLERGEN_CHIPS = [
  { code: "GLUTEN", label: "Gluten-free" },
  { code: "MILK", label: "Dairy-free" },
  { code: "EGGS", label: "No eggs" },
  { code: "FISH", label: "No fish" },
  { code: "CRUSTACEANS", label: "No shellfish" },
  { code: "NUTS", label: "Nut-free" },
  { code: "PEANUTS", label: "No peanuts" },
  { code: "SOYBEANS", label: "No soy" },
  { code: "VEGAN", label: "Vegan", isDietary: true },
  { code: "VEGETARIAN", label: "Vegetarian", isDietary: true },
];

export function AllergyFilter({
  onFilterChange,
}: {
  onFilterChange: (excluded: string[], dietary: string[]) => void;
}) {
  const [active, setActive] = useState<Set<string>>(new Set());

  function toggle(code: string) {
    const next = new Set(active);
    if (next.has(code)) { next.delete(code); } else { next.add(code); }

    const excluded = [...next].filter(
      (c) => !ALLERGEN_CHIPS.find((a) => a.code === c && a.isDietary),
    );
    const dietary = [...next].filter(
      (c) => ALLERGEN_CHIPS.find((a) => a.code === c && a.isDietary),
    );

    setActive(next);
    onFilterChange(excluded, dietary);
  }

  return (
    <div
      className="overflow-x-auto"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-2 px-4 pb-3 pt-2" style={{ width: "max-content" }}>
        {ALLERGEN_CHIPS.map(({ code, label }) => {
          const on = active.has(code);
          return (
            <button
              key={code}
              onClick={() => toggle(code)}
              className="rounded-full px-3.5 py-2 text-xs font-semibold transition-all"
              style={
                on
                  ? { background: "var(--color-accent)", color: "white" }
                  : { background: "var(--color-line)", color: "var(--color-muted)" }
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
