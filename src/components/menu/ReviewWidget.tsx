"use client";

import { Heart, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "rating" | "comment" | "done";

const COPY: Record<string, {
  title: string;
  subtitle: string;
  submit: string;
  cancel: string;
  thanks: string;
  thankYouGoogle: string;
  placeholder: string;
  googleBtn: string;
  close: string;
}> = {
  pt: {
    title: "Como foi a sua experiência?",
    subtitle: "A sua opinião ajuda-nos a melhorar",
    submit: "Enviar",
    cancel: "Cancelar",
    thanks: "Obrigado pelo seu feedback!",
    thankYouGoogle: "Ficamos contentes! Partilhe a sua opinião no Google.",
    placeholder: "Diga-nos como podemos melhorar...",
    googleBtn: "Avaliar no Google",
    close: "Fechar",
  },
  en: {
    title: "How was your experience?",
    subtitle: "Your feedback helps us improve",
    submit: "Submit",
    cancel: "Cancel",
    thanks: "Thank you for your feedback!",
    thankYouGoogle: "So glad you enjoyed it! Share on Google.",
    placeholder: "Tell us how we can improve...",
    googleBtn: "Review on Google",
    close: "Close",
  },
  es: {
    title: "¿Cómo fue su experiencia?",
    subtitle: "Sus comentarios nos ayudan a mejorar",
    submit: "Enviar",
    cancel: "Cancelar",
    thanks: "¡Gracias por sus comentarios!",
    thankYouGoogle: "¡Nos alegra que lo haya disfrutado! Comparta en Google.",
    placeholder: "Díganos cómo podemos mejorar...",
    googleBtn: "Reseña en Google",
    close: "Cerrar",
  },
  fr: {
    title: "Comment s'est passée votre visite ?",
    subtitle: "Vos retours nous aident à progresser",
    submit: "Envoyer",
    cancel: "Annuler",
    thanks: "Merci pour votre retour !",
    thankYouGoogle: "Nous sommes ravis ! Partagez sur Google.",
    placeholder: "Dites-nous comment nous améliorer...",
    googleBtn: "Avis sur Google",
    close: "Fermer",
  },
  de: {
    title: "Wie war Ihr Erlebnis?",
    subtitle: "Ihr Feedback hilft uns, besser zu werden",
    submit: "Senden",
    cancel: "Abbrechen",
    thanks: "Vielen Dank für Ihr Feedback!",
    thankYouGoogle: "Schön, dass es Ihnen gefallen hat! Teilen Sie auf Google.",
    placeholder: "Sagen Sie uns, wie wir uns verbessern können...",
    googleBtn: "Auf Google bewerten",
    close: "Schließen",
  },
};

export function ReviewWidget({
  restaurantId,
  googleReviewUrl,
  locale,
}: {
  restaurantId: string;
  googleReviewUrl: string | null;
  locale: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRated = useRef(false);

  const L = COPY[locale] ?? COPY.en!;

  // Schedule popup: 2 minutes after load, then every 2 minutes if still idle
  useEffect(() => {
    if (hasRated.current) return;
    timerRef.current = setTimeout(() => {
      if (!hasRated.current) setPhase("rating");
    }, 2 * 60 * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function reschedule() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hasRated.current) return;
    timerRef.current = setTimeout(() => {
      if (!hasRated.current) setPhase("rating");
    }, 2 * 60 * 1000);
  }

  function openRating() {
    setPhase("rating");
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function handleStar(n: number) {
    setRating(n);
    hasRated.current = true;
    if (n >= 4 && googleReviewUrl) {
      setPhase("done");
      // Open Google review in new tab after short delay so user sees the thank-you
    } else {
      setPhase("comment");
    }
  }

  async function submitFeedback() {
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment, locale }),
      });
    } catch {
      // fail silently — network error shouldn't disrupt the customer
    }
    setSubmitting(false);
    setPhase("done");
  }

  function dismiss() {
    setPhase("idle");
    setRating(0);
    setHovered(0);
    setComment("");
    reschedule();
  }

  const starColor = (n: number) =>
    n <= (hovered || rating) ? "#6B1D2A" : "#D6CBBF";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={openRating}
        className="fixed bottom-6 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "var(--color-accent)",
          color: "white",
          width: "52px",
          height: "52px",
        }}
        aria-label={L.title}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      {/* Backdrop + modal */}
      {phase !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center"
          style={{ background: "rgba(28,25,23,0.65)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "#FAF7F2" }}
          >
            {/* Rating phase */}
            {phase === "rating" && (
              <div className="p-7 text-center">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className="font-display text-xl font-semibold"
                      style={{
                        fontFamily: "var(--font-display, Georgia), serif",
                        color: "var(--color-ink)",
                      }}
                    >
                      {L.title}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                      {L.subtitle}
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    className="ml-3 flex-shrink-0 rounded-full p-1 opacity-30 transition-opacity hover:opacity-60"
                    style={{ color: "var(--color-ink)" }}
                    aria-label="Close"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleStar(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={40}
                        strokeWidth={1.5}
                        style={{
                          color: starColor(n),
                          fill: n <= (hovered || rating) ? starColor(n) : "none",
                          transition: "color 0.1s, fill 0.1s",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment phase (sub-4 stars) */}
            {phase === "comment" && (
              <div className="p-6">
                <p
                  className="font-display text-lg font-semibold text-center"
                  style={{
                    fontFamily: "var(--font-display, Georgia), serif",
                    color: "var(--color-ink)",
                  }}
                >
                  {L.title}
                </p>
                <div className="mt-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={20}
                      strokeWidth={1.5}
                      style={{
                        color: n <= rating ? "#6B1D2A" : "#D6CBBF",
                        fill: n <= rating ? "#6B1D2A" : "none",
                      }}
                    />
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={L.placeholder}
                  rows={4}
                  className="mt-4 w-full resize-none rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                    background: "white",
                    // @ts-expect-error CSS custom property
                    "--tw-ring-color": "var(--color-accent)",
                  }}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={dismiss}
                    className="flex-1 rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-70"
                    style={{ background: "var(--color-line)", color: "var(--color-muted)" }}
                  >
                    {L.cancel}
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {submitting ? "..." : L.submit}
                  </button>
                </div>
              </div>
            )}

            {/* Done phase */}
            {phase === "done" && (
              <div className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  {rating >= 4
                    ? <Star size={48} strokeWidth={1.25} style={{ color: "#6B1D2A", fill: "#6B1D2A" }} />
                    : <Heart size={48} strokeWidth={1.25} style={{ color: "#6B1D2A", fill: "#6B1D2A80" }} />
                  }
                </div>
                <p
                  className="font-display text-xl font-semibold"
                  style={{
                    fontFamily: "var(--font-display, Georgia), serif",
                    color: "var(--color-ink)",
                  }}
                >
                  {rating >= 4 ? L.thankYouGoogle : L.thanks}
                </p>

                {rating >= 4 && googleReviewUrl && (
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {L.googleBtn}
                  </a>
                )}

                <button
                  onClick={() => { setPhase("idle"); setRating(0); }}
                  className="mt-4 block w-full py-1 text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-muted)" }}
                >
                  {L.close}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
