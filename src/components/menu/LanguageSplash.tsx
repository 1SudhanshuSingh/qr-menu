"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "~/navigation";

const LANG_NAMES: Record<string, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export function LanguageSplash({
  enabledLocales,
  currentLocale,
  slug,
  restaurantName,
}: {
  enabledLocales: string[];
  currentLocale: string;
  slug: string;
  restaurantName: string;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (enabledLocales.length <= 1) return;
    try {
      const chosen = localStorage.getItem(`lang_${slug}`);
      if (!chosen) setShow(true);
    } catch {
      // localStorage not available (private mode etc.)
    }
  }, [enabledLocales, slug]);

  function choose(locale: string) {
    try {
      localStorage.setItem(`lang_${slug}`, locale);
    } catch {}
    setShow(false);
    if (locale !== currentLocale) {
      router.replace(pathname, { locale });
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(28,25,23,0.88)", backdropFilter: "blur(10px)" }}
    >
      <div className="w-full max-w-xs overflow-hidden rounded-2xl shadow-2xl">
        {/* Azulejo header */}
        <div
          className="relative overflow-hidden px-6 py-8 text-center"
          style={{ background: "#1A3A6C" }}
        >
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.12]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="az-lang"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="1" />
                <rect
                  x="1"
                  y="1"
                  width="38"
                  height="38"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#az-lang)" />
          </svg>
          <p
            className="relative font-display text-2xl font-semibold tracking-wide text-white"
            style={{ fontFamily: "var(--font-display, Georgia), serif" }}
          >
            {restaurantName}
          </p>
        </div>

        {/* Language options */}
        <div className="p-5" style={{ background: "#FAF7F2" }}>
          <p
            className="mb-4 text-center text-xs font-medium uppercase tracking-widest"
            style={{ color: "#78716C" }}
          >
            Choose your language
          </p>
          <div className="space-y-2.5">
            {enabledLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => choose(locale)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-semibold transition-all"
                style={
                  locale === currentLocale
                    ? { background: "#1A3A6C", color: "white" }
                    : { background: "#F0EBE3", color: "#1C1917" }
                }
              >
                <span>{LANG_NAMES[locale] ?? locale.toUpperCase()}</span>
                <span
                  className="text-xs font-normal uppercase tracking-widest opacity-60"
                >
                  {locale.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
