"use client";

import { Download, Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type Preset = "tinto" | "azeite" | "atlântico";

const PRESETS: Record<Preset, {
  label: string;
  bg: string;
  surface: string;
  ink: string;
  accent: string;
  muted: string;
  borderStyle: string;
}> = {
  tinto: {
    label: "Tinto",
    bg: "#FAF7F2",
    surface: "#FFFFFF",
    ink: "#1C1917",
    accent: "#6B1D2A",
    muted: "#78716C",
    borderStyle: "1px solid #E8E0D8",
  },
  azeite: {
    label: "Azeite",
    bg: "#F5F3EE",
    surface: "#FFFFFF",
    ink: "#1A2410",
    accent: "#3D5A27",
    muted: "#6B7560",
    borderStyle: "1px solid #D4D9C8",
  },
  atlântico: {
    label: "Atlântico",
    bg: "#0D1B2A",
    surface: "#152338",
    ink: "#F0EDE8",
    accent: "#C4A35A",
    muted: "#8FA0B4",
    borderStyle: "1px solid #1E3250",
  },
};

type Props = {
  tableNumber: string;
  tableLabel?: string | null;
  restaurantName: string;
  restaurantSlug: string;
  logoUrl?: string | null;
  appUrl: string;
  onClose: () => void;
};

export function StandeeDesigner({
  tableNumber,
  tableLabel,
  restaurantName,
  restaurantSlug,
  logoUrl,
  appUrl,
  onClose,
}: Props) {
  const [preset, setPreset] = useState<Preset>("tinto");
  const [showTagline, setShowTagline] = useState(true);
  const [tagline, setTagline] = useState("Scan to view our menu");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const theme = PRESETS[preset];

  const menuUrl = `${appUrl}/pt/m/${restaurantSlug}?table=${encodeURIComponent(tableNumber)}`;

  // Generate QR SVG data URL whenever the menu URL changes
  useEffect(() => {
    void QRCode.toDataURL(menuUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: preset === "atlântico" ? "#C4A35A" : "#1C1917",
        light: preset === "atlântico" ? "#152338" : "#FFFFFF",
      },
    }).then(setQrDataUrl);
  }, [menuUrl, preset]);

  function print() {
    const el = printRef.current;
    if (!el) return;

    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) return;

    win.document.write(`<!doctype html><html><head>
      <meta charset="utf-8">
      <title>Table ${tableNumber} — ${restaurantName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        @media print {
          @page { size: A5 portrait; margin: 0; }
          body { min-height: 0; }
        }
      </style>
    </head><body>${el.innerHTML}
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
    </body></html>`);
    win.document.close();
  }

  async function downloadPng() {
    // Use the browser's built-in screenshot via the Print window
    // For a proper PNG export we open the print dialog — user saves as PDF/PNG
    print();
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(28,25,23,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:flex-row lg:items-start">

        {/* Controls panel */}
        <div
          className="w-full shrink-0 rounded-2xl p-6 lg:w-72"
          style={{ background: "#FAF7F2", border: "1px solid #E8E0D8" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "#1C1917" }}>
              Standee designer
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 opacity-40 hover:opacity-70"
              style={{ color: "#1C1917" }}
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-1 text-xs" style={{ color: "#78716C" }}>
            Table {tableNumber}{tableLabel ? ` — ${tableLabel}` : ""}
          </p>

          {/* Preset picker */}
          <div className="mt-5">
            <Label>Theme preset</Label>
            <div className="mt-2 flex gap-2">
              {(Object.keys(PRESETS) as Preset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all"
                  style={
                    preset === p
                      ? { background: "#1C1917", color: "white" }
                      : { background: "#F0EBE3", color: "#78716C" }
                  }
                >
                  {PRESETS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Label>Tagline</Label>
              <Toggle value={showTagline} onChange={setShowTagline} />
            </div>
            {showTagline && (
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={60}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
              />
            )}
          </div>

          {/* URL preview */}
          <div className="mt-5">
            <Label>QR encodes</Label>
            <p
              className="mt-1 break-all rounded-lg px-3 py-2 text-xs"
              style={{ background: "#F0EBE3", color: "#78716C" }}
            >
              {menuUrl}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={print}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#1C1917" }}
            >
              <Printer size={15} />
              Print / Save as PDF
            </button>
            <button
              onClick={downloadPng}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "#F0EBE3", color: "#6B1D2A" }}
            >
              <Download size={15} />
              Download PNG
            </button>
          </div>

          <p className="mt-3 text-center text-xs" style={{ color: "#A8A29E" }}>
            Opens a print dialog — save as PDF or PNG
          </p>
        </div>

        {/* Live preview */}
        <div className="flex flex-1 justify-center">
          <div ref={printRef}>
            <Standee
              theme={theme}
              restaurantName={restaurantName}
              logoUrl={logoUrl ?? null}
              tableNumber={tableNumber}
              tableLabel={tableLabel ?? null}
              tagline={showTagline ? tagline : null}
              qrDataUrl={qrDataUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── The printable standee card ────────────────────────────────

type StandeeProps = {
  theme: (typeof PRESETS)[Preset];
  restaurantName: string;
  logoUrl: string | null;
  tableNumber: string;
  tableLabel: string | null;
  tagline: string | null;
  qrDataUrl: string;
};

function Standee({ theme, restaurantName, logoUrl, tableNumber, tableLabel, tagline, qrDataUrl }: StandeeProps) {
  return (
    <div
      style={{
        width: "340px",
        background: theme.bg,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Top colour band */}
      <div style={{ background: theme.accent, height: "8px" }} />

      {/* Header */}
      <div style={{ padding: "28px 28px 20px", textAlign: "center" }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={restaurantName}
            style={{ height: "52px", objectFit: "contain", margin: "0 auto 12px" }}
          />
        ) : (
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: theme.accent,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
              margin: "0 auto 12px",
            }}
          >
            {restaurantName[0]}
          </div>
        )}
        <p
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}
        >
          {restaurantName}
        </p>
        {tagline && (
          <p style={{ fontSize: "12px", color: theme.muted, marginTop: "5px", letterSpacing: "0.03em" }}>
            {tagline}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{ margin: "0 28px", borderTop: theme.borderStyle }} />

      {/* QR code */}
      <div style={{ padding: "24px 28px", display: "flex", justifyContent: "center" }}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR code"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "16px",
              border: theme.borderStyle,
            }}
          />
        ) : (
          <div style={{ width: "200px", height: "200px", borderRadius: "16px", background: theme.surface }} />
        )}
      </div>

      {/* Divider */}
      <div style={{ margin: "0 28px", borderTop: theme.borderStyle }} />

      {/* Table number */}
      <div style={{ padding: "20px 28px 28px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: theme.muted }}>
          Table
        </p>
        <p
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: theme.accent,
            lineHeight: 1,
            marginTop: "2px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tableNumber}
        </p>
        {tableLabel && (
          <p style={{ fontSize: "12px", color: theme.muted, marginTop: "4px" }}>
            {tableLabel}
          </p>
        )}
      </div>

      {/* Bottom colour band */}
      <div style={{ background: theme.accent, height: "8px" }} />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
      {children}
    </p>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{ background: value ? "#6B1D2A" : "#D6CBBF" }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}
