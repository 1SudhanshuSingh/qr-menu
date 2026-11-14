"use client";

import { useState } from "react";

type CallType = "waiter" | "bill" | "help";

const OPTIONS: { type: CallType; icon: string; label: Record<string, string> }[] = [
  {
    type: "waiter",
    icon: "🙋",
    label: { pt: "Chamar empregado", en: "Call waiter", es: "Llamar al camarero", fr: "Appeler le serveur", de: "Kellner rufen" },
  },
  {
    type: "bill",
    icon: "💳",
    label: { pt: "Pedir a conta", en: "Request bill", es: "Pedir la cuenta", fr: "Demander l'addition", de: "Rechnung bitte" },
  },
];

export function WaiterCallWidget({
  restaurantId,
  tableNumber,
  locale,
}: {
  restaurantId: string;
  tableNumber?: string;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [table, setTable] = useState(tableNumber ?? "");
  const [loading, setLoading] = useState(false);

  if (!tableNumber && !open) return null; // Only show if table number known, or user opens it

  async function sendCall(type: CallType) {
    if (!table) return;
    setLoading(true);
    try {
      await fetch("/api/waiter-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableNumber: table, type }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); }, 3000);
    } catch {}
    setLoading(false);
  }

  return (
    <>
      {/* Floating bell button — left side so it doesn't overlap the review star */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 z-40 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "var(--color-category, #1A3A6C)",
          color: "white",
          width: "52px",
          height: "52px",
        }}
        aria-label="Call waiter"
      >
        🔔
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center"
          style={{ background: "rgba(28,25,23,0.65)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl"
            style={{ background: "#FAF7F2" }}
          >
            {sent ? (
              <div className="p-8 text-center">
                <div className="mb-3 text-5xl">✅</div>
                <p
                  className="font-display text-xl font-semibold"
                  style={{ fontFamily: "Georgia, serif", color: "var(--color-ink)" }}
                >
                  {locale === "pt" ? "A caminho!" : "On the way!"}
                </p>
              </div>
            ) : (
              <div className="p-6">
                <p
                  className="font-display text-xl font-semibold"
                  style={{ fontFamily: "Georgia, serif", color: "var(--color-ink)" }}
                >
                  {locale === "pt" ? "Como podemos ajudar?" : "How can we help?"}
                </p>

                {!tableNumber && (
                  <input
                    type="text"
                    value={table}
                    onChange={(e) => setTable(e.target.value)}
                    placeholder={locale === "pt" ? "Número da mesa" : "Table number"}
                    className="mt-3 w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
                  />
                )}

                <div className="mt-4 space-y-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => sendCall(opt.type)}
                      disabled={loading || !table}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{
                        background: "var(--color-category, #1A3A6C)",
                        color: "white",
                      }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label[locale] ?? opt.label.en}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="mt-3 w-full py-2 text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-muted)" }}
                >
                  {locale === "pt" ? "Cancelar" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
