"use client";

import { useState } from "react";

const ALLERGEN_CHIPS = [
  { code: "GLUTEN", icon: "🌾", label: "Gluten-free" },
  { code: "MILK", icon: "🥛", label: "Dairy-free" },
  { code: "EGGS", icon: "🥚", label: "No eggs" },
  { code: "FISH", icon: "🐟", label: "No fish" },
  { code: "CRUSTACEANS", icon: "🦐", label: "No shellfish" },
  { code: "NUTS", icon: "🌰", label: "Nut-free" },
  { code: "PEANUTS", icon: "🥜", label: "No peanuts" },
  { code: "SOYBEANS", icon: "🫘", label: "No soy" },
  { code: "VEGAN", icon: "🌿", label: "Vegan", isDietary: true },
  { code: "VEGETARIAN", icon: "🥦", label: "Vegetarian", isDietary: true },
];

export function AllergyFilter({
  onFilterChange,
}: {
  onFilterChange: (excluded: string[], dietary: string[]) => void;
}) {
  const [active, setActive] = useState<Set<string>>(new Set());

  function toggle(code: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(code)) { next.delete(code); } else { next.add(code); }

      const excluded = [...next].filter(
        (c) => !ALLERGEN_CHIPS.find((a) => a.code === c && a.isDietary),
      );
      const dietary = [...next].filter(
        (c) => ALLERGEN_CHIPS.find((a) => a.code === c && a.isDietary),
      );
      onFilterChange(excluded, dietary);
      return next;
    });
  }

  return (
    <div
      className="overflow-x-auto"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-2 px-4 pb-3 pt-2" style={{ width: "max-content" }}>
        {ALLERGEN_CHIPS.map(({ code, icon, label }) => {
          const on = active.has(code);
          return (
            <button
              key={code}
              onClick={() => toggle(code)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all"
              style={
                on
                  ? { background: "var(--color-accent)", color: "white" }
                  : { background: "var(--color-line)", color: "var(--color-muted)" }
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
