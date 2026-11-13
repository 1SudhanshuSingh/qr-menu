const BADGES: Record<string, { label: string; bg: string; color: string }> = {
  VEGAN:       { label: "Vegan",    bg: "#ECFDF5", color: "#065F46" },
  VEGETARIAN:  { label: "Veg.",     bg: "#ECFDF5", color: "#065F46" },
  BEEF:        { label: "Vaca",     bg: "#FEF3C7", color: "#92400E" },
  PORK:        { label: "Porco",    bg: "#FEF3C7", color: "#92400E" },
  CHICKEN:     { label: "Frango",   bg: "#FEF3C7", color: "#92400E" },
  FISH:        { label: "Peixe",    bg: "#EFF6FF", color: "#1E40AF" },
  SEAFOOD:     { label: "Marisco",  bg: "#EFF6FF", color: "#1E40AF" },
  OLD_GOAT:    { label: "Cabra",    bg: "#F5F3FF", color: "#5B21B6" },
};

export function DietaryBadge({ tag }: { tag: string }) {
  const badge = BADGES[tag];
  if (!badge) return null;

  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: badge.bg, color: badge.color }}
    >
      {badge.label}
    </span>
  );
}
