"use client";

import { type WaiterCall } from "@prisma/client";
import { AlertCircle, Check, CheckCircle2, CreditCard, UserRound } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

const TYPE_LABEL: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  waiter: { label: "Call waiter",    Icon: UserRound,    color: "#1A3A6C" },
  bill:   { label: "Request bill",   Icon: CreditCard,   color: "#6B1D2A" },
  help:   { label: "Need help",      Icon: AlertCircle,  color: "#DC2626" },
};

export function LiveCallsBoard({
  initialCalls,
  restaurantId,
}: {
  initialCalls: WaiterCall[];
  restaurantId: string;
}) {
  const [calls, setCalls] = useState<WaiterCall[]>(initialCalls);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/waiter-call?restaurantId=${restaurantId}`);
        const data = (await res.json()) as WaiterCall[];
        setCalls(data);
      } catch {}
    };
    const interval = setInterval(() => { void poll(); }, 15000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  async function resolve(id: string) {
    await fetch("/api/waiter-call", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCalls((prev) => prev.filter((c) => c.id !== id));
  }

  if (calls.length === 0) {
    return (
      <div
        className="rounded-2xl px-6 py-16 text-center"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <CheckCircle2 size={40} strokeWidth={1.25} style={{ color: "#2D6A4F", margin: "0 auto" }} />
        <p className="mt-3 font-semibold" style={{ color: "#1C1917" }}>
          All clear
        </p>
        <p className="text-sm" style={{ color: "#78716C" }}>
          No active table calls right now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {calls.map((call) => {
        const type = TYPE_LABEL[call.type] ?? TYPE_LABEL.waiter!;
        const { Icon } = type;
        const age = Math.round((Date.now() - new Date(call.createdAt).getTime()) / 60000);
        return (
          <div
            key={call.id}
            className="flex items-start gap-4 rounded-2xl p-5"
            style={{ background: "white", border: `2px solid ${type.color}20` }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${type.color}12` }}
            >
              <Icon size={18} strokeWidth={1.75} style={{ color: type.color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: type.color }}>
                {type.label}
              </p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "#1C1917" }}>
                Table {call.tableNumber}
              </p>
              {call.note && (
                <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
                  {call.note}
                </p>
              )}
              <p className="mt-1 text-xs" style={{ color: "#A8A29E" }}>
                {age < 1 ? "Just now" : `${age} min ago`}
              </p>
            </div>
            <button
              onClick={() => resolve(call.id)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: "#2D6A4F" }}
            >
              <Check size={14} strokeWidth={2.5} />
              Done
            </button>
          </div>
        );
      })}
    </div>
  );
}
