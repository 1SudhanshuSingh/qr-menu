"use client";

import { type Restaurant } from "@prisma/client";
import { useState } from "react";
import { api } from "~/trpc/react";

const LOCALES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1C1917" }}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: "#A8A29E" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
      style={{ borderColor: "#E8E0D8", color: "#1C1917", background: "white" }}
    />
  );
}

export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [name, setName] = useState(restaurant.name);
  const [tagline, setTagline] = useState(restaurant.tagline ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [instagram, setInstagram] = useState(restaurant.instagramHandle ?? "");
  const [googleUrl, setGoogleUrl] = useState(restaurant.googleReviewUrl ?? "");
  const [enabledLocales, setEnabledLocales] = useState<string[]>(restaurant.enabledLocales);
  const [saved, setSaved] = useState(false);

  const updateInfo = api.restaurant.updateInfo.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateInfo.mutate({
      restaurantId: restaurant.id,
      name,
      tagline,
      address,
      phone,
      email: email || undefined,
      instagramHandle: instagram,
      googleReviewUrl: googleUrl || undefined,
      enabledLocales,
    });
  }

  function toggleLocale(code: string) {
    setEnabledLocales((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Basic info */}
      <div
        className="space-y-4 rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
          Basic info
        </h2>
        <Field label="Restaurant name">
          <Input value={name} onChange={setName} placeholder="Alma Portuguesa" />
        </Field>
        <Field label="Tagline" hint="Short description shown in the menu header">
          <Input value={tagline} onChange={setTagline} placeholder="Cozinha portuguesa tradicional" />
        </Field>
        <Field label="Address">
          <Input value={address} onChange={setAddress} placeholder="Rua dos Restauradores 42, Lisboa" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <Input value={phone} onChange={setPhone} placeholder="+351 21 000 0000" />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={setEmail} placeholder="hello@restaurant.pt" />
          </Field>
        </div>
      </div>

      {/* Social & reviews */}
      <div
        className="space-y-4 rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
          Social & reviews
        </h2>
        <Field label="Instagram handle" hint="Without the @">
          <div className="flex">
            <span
              className="flex items-center rounded-l-xl border border-r-0 px-3 text-sm"
              style={{ borderColor: "#E8E0D8", background: "#F7F5F2", color: "#78716C" }}
            >
              @
            </span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="almaportuguesa"
              className="flex-1 rounded-r-xl border px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
            />
          </div>
        </Field>
        <Field label="Google review URL" hint="Customers with 4+ stars get sent here">
          <Input value={googleUrl} onChange={setGoogleUrl} placeholder="https://g.page/r/..." />
        </Field>
      </div>

      {/* Languages */}
      <div
        className="space-y-4 rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>
          Enabled languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map(({ code, label }) => {
            const on = enabledLocales.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleLocale(code)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
                style={
                  on
                    ? { background: "#1A3A6C", color: "white", borderColor: "#1A3A6C" }
                    : { background: "white", color: "#78716C", borderColor: "#E8E0D8" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updateInfo.isPending}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#6B1D2A" }}
        >
          {updateInfo.isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="text-sm" style={{ color: "#2D6A4F" }}>
            ✓ Saved successfully
          </span>
        )}
      </div>
    </form>
  );
}
