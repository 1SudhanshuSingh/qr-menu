import { formatPrice } from "~/lib/format";
import { DietaryIcon } from "./DietaryIcon";

type Props = {
  name: string;
  description?: string;
  pricecents: number;
  locale: string;
  currency: string;
  isAvailable: boolean;
  dietaryTags: string[];
  imageUrl?: string;
  soldOutLabel: string;
};

export function DishRow({
  name,
  description,
  pricecents,
  locale,
  currency,
  isAvailable,
  dietaryTags,
  imageUrl,
  soldOutLabel,
}: Props) {
  return (
    <div className={`flex items-start gap-3 py-3.5 ${!isAvailable ? "opacity-50" : ""}`}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="mt-0.5 h-16 w-16 flex-shrink-0 rounded-theme object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-display text-[1.05rem] font-medium leading-snug text-ink">
            {name}
          </span>
          <span className="tabular-nums flex-shrink-0 text-sm font-medium text-ink">
            {formatPrice(pricecents, locale, currency)}
          </span>
        </div>
        {description && (
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{description}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          {dietaryTags.map((tag) => (
            <DietaryIcon key={tag} tag={tag} />
          ))}
          {!isAvailable && (
            <span className="rounded bg-line px-1.5 py-0.5 text-xs font-medium text-muted">
              {soldOutLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
