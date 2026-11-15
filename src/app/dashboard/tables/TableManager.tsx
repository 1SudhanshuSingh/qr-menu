"use client";

import { type Table } from "@prisma/client";
import { Layers, Palette, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { StandeeDesigner } from "~/components/dashboard/StandeeDesigner";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export function TableManager({
  initialTables,
  restaurant,
  appUrl,
}: {
  initialTables: Table[];
  restaurant: Restaurant;
  appUrl: string;
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [number, setNumber] = useState("");
  const [label, setLabel] = useState("");
  const [bulkFrom, setBulkFrom] = useState("1");
  const [bulkTo, setBulkTo] = useState("10");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [error, setError] = useState("");
  const [designer, setDesigner] = useState<Table | null>(null);

  const utils = api.useUtils();

  async function reload() {
    const updated = await utils.tables.list.fetch({ restaurantId: restaurant.id });
    setTables(updated);
  }

  const create = api.tables.create.useMutation({
    onSuccess: () => { void reload(); setNumber(""); setLabel(""); setError(""); },
    onError: (e) => setError(e.message.includes("Unique") ? `Table "${number}" already exists.` : e.message),
  });

  const createBulk = api.tables.createBulk.useMutation({
    onSuccess: (data) => { void reload(); setError(""); alert(`Created ${data.created} tables.`); },
    onError: (e) => setError(e.message),
  });

  const deleteMutation = api.tables.delete.useMutation({
    onSuccess: (deleted) => setTables((prev) => prev.filter((t) => t.id !== deleted.id)),
  });

  function submitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) { setError("Table number is required."); return; }
    create.mutate({ restaurantId: restaurant.id, number: number.trim(), label: label.trim() || undefined });
  }

  function submitBulk(e: React.FormEvent) {
    e.preventDefault();
    const f = parseInt(bulkFrom);
    const t = parseInt(bulkTo);
    if (isNaN(f) || isNaN(t) || t < f) { setError("Invalid range."); return; }
    if (t - f > 99) { setError("Maximum 100 tables at once."); return; }
    createBulk.mutate({ restaurantId: restaurant.id, from: f, to: t });
  }

  const busy = create.isPending || createBulk.isPending;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Left: table list */}
        <div>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: "white", border: "1px solid #E8E0D8" }}
          >
            {tables.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Layers size={36} strokeWidth={1.25} style={{ color: "#D6CEC7", margin: "0 auto" }} />
                <p className="mt-3 font-medium" style={{ color: "#1C1917" }}>No tables yet</p>
                <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
                  Add your tables and get a unique QR code for each one.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0EBE3" }}>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>Table</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>Label</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>QR Menu URL</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "#A8A29E" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((t, i) => (
                    <tr
                      key={t.id}
                      style={{ borderTop: i > 0 ? "1px solid #F7F5F2" : "none" }}
                    >
                      <td className="px-5 py-3.5 font-semibold tabular-nums" style={{ color: "#1C1917" }}>
                        {t.number}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#78716C" }}>
                        {t.label ?? <span style={{ color: "#D6CEC7" }}>—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="rounded px-1.5 py-0.5 text-xs"
                          style={{ background: "#F0EBE3", color: "#78716C", fontFamily: "monospace" }}
                        >
                          /m/{restaurant.slug}?table={t.number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDesigner(t)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-stone-50"
                            style={{ color: "#6B1D2A", border: "1px solid #E8E0D8" }}
                            title="Design standee"
                          >
                            <Palette size={12} />
                            Standee
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ tableId: t.id })}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                            style={{ color: "#DC2626" }}
                            title="Delete table"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: add form */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid #E8E0D8" }}
        >
          <h3 className="font-semibold" style={{ color: "#1C1917" }}>Add tables</h3>

          {/* Mode toggle */}
          <div className="mt-3 flex rounded-xl p-1" style={{ background: "#F0EBE3" }}>
            {(["single", "bulk"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all"
                style={
                  mode === m
                    ? { background: "white", color: "#1C1917", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                    : { color: "#78716C" }
                }
              >
                {m === "single" ? "Single" : "Bulk range"}
              </button>
            ))}
          </div>

          {mode === "single" ? (
            <form onSubmit={submitSingle} className="mt-4 space-y-3">
              <Field label="Table number *">
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="e.g. 1, A3, Bar 2"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
                />
              </Field>
              <Field label="Label (optional)">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Window seat, Terrace"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
                />
              </Field>
              {error && <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "#1C1917" }}
              >
                <Plus size={15} strokeWidth={2.5} />
                {busy ? "Adding…" : "Add table"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitBulk} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="From">
                  <input
                    type="number"
                    min={1}
                    value={bulkFrom}
                    onChange={(e) => setBulkFrom(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
                  />
                </Field>
                <Field label="To">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={bulkTo}
                    onChange={(e) => setBulkTo(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: "#E8E0D8", color: "#1C1917" }}
                  />
                </Field>
              </div>
              <p className="text-xs" style={{ color: "#78716C" }}>
                Creates tables numbered {bulkFrom}–{bulkTo} ({Math.max(0, parseInt(bulkTo) - parseInt(bulkFrom) + 1)} tables)
              </p>
              {error && <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "#1C1917" }}
              >
                <Plus size={15} strokeWidth={2.5} />
                {busy ? "Creating…" : `Create ${Math.max(0, parseInt(bulkTo) - parseInt(bulkFrom) + 1)} tables`}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Standee designer overlay */}
      {designer && (
        <StandeeDesigner
          tableNumber={designer.number}
          tableLabel={designer.label}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug}
          logoUrl={restaurant.logoUrl}
          appUrl={appUrl}
          onClose={() => setDesigner(null)}
        />
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium" style={{ color: "#78716C" }}>{label}</span>
      {children}
    </label>
  );
}
