"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Bell,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Layers,
  Palette,
  QrCode,
  Settings,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

const NAV: { href: string; label: string; Icon: LucideIcon; exact?: boolean }[] = [
  { href: "/dashboard",              label: "Overview",      Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/menu",         label: "Menu",          Icon: UtensilsCrossed },
  { href: "/dashboard/calls",        label: "Live Calls",    Icon: Bell },
  { href: "/dashboard/tables",       label: "Tables & QR",   Icon: Layers },
  { href: "/dashboard/reviews",      label: "Reviews",       Icon: Star },
  { href: "/dashboard/analytics",    label: "Analytics",     Icon: BarChart2 },
  { href: "/dashboard/translations", label: "Translations",  Icon: Globe },
  { href: "/dashboard/branding",     label: "Branding",      Icon: Palette },
  { href: "/dashboard/qr",           label: "QR Code",       Icon: QrCode },
  { href: "/dashboard/settings",     label: "Settings",      Icon: Settings },
];

export function Sidebar({ restaurantName }: { restaurantName: string }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className="flex h-full w-56 flex-col"
      style={{ background: "#1C1917", color: "#FAF7F2" }}
    >
      {/* Logo area */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: "#6B1D2A", color: "white" }}
        >
          {restaurantName[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{restaurantName}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Dashboard
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
              style={
                active
                  ? { background: "rgba(255,255,255,0.1)", color: "white" }
                  : { color: "rgba(255,255,255,0.55)" }
              }
            >
              <Icon size={15} strokeWidth={1.75} />
              <span className="font-medium">{label}</span>
              {href === "/dashboard/calls" && <LiveCallsBadge />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <a
          href="/pt/m/alma-portuguesa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ExternalLink size={12} />
          <span>View live menu</span>
        </a>
      </div>
    </aside>
  );
}

function LiveCallsBadge() {
  return (
    <span
      id="live-calls-badge"
      className="ml-auto hidden rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
      style={{ background: "#DC2626" }}
    />
  );
}
