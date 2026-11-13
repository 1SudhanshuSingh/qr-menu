const ICONS: Record<string, { emoji: string; label: string }> = {
  VEGAN: { emoji: "🌿", label: "Vegan" },
  VEGETARIAN: { emoji: "🥗", label: "Vegetarian" },
  BEEF: { emoji: "🐄", label: "Beef" },
  PORK: { emoji: "🐷", label: "Pork" },
  CHICKEN: { emoji: "🐓", label: "Chicken" },
  FISH: { emoji: "🐟", label: "Fish" },
  SEAFOOD: { emoji: "🦑", label: "Seafood" },
  OLD_GOAT: { emoji: "🐐", label: "Old Goat" },
};

export function DietaryIcon({ tag }: { tag: string }) {
  const icon = ICONS[tag];
  if (!icon) return null;

  return (
    <span
      title={icon.label}
      aria-label={icon.label}
      className="text-sm"
      role="img"
    >
      {icon.emoji}
    </span>
  );
}
