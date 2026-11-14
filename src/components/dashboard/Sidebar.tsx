"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "⬛", exact: true },
  { href: "/dashboard/menu", label: "Menu", icon: "🍽️" },
  { href: "/dashboard/calls", label: "Live Calls", icon: "🔔" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "⭐" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/translations", label: "Translations", icon: "🌐" },
  { href: "/dashboard/branding", label: "Branding", icon: "🎨" },
  { href: "/dashboard/qr", label: "QR Code", icon: "📱" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
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
        {NAV.map(({ href, label, icon, exact }) => {
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
              <span className="text-base leading-none">{icon}</span>
              <span className="font-medium">{label}</span>
              {href === "/dashboard/calls" && (
                <LiveCallsBadge />
              )}
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
          <span>↗</span>
          <span>View live menu</span>
        </a>
      </div>
    </aside>
  );
}

// Tiny live badge that shows unresolved call count
function LiveCallsBadge() {
  return (
    <span
      id="live-calls-badge"
      className="ml-auto hidden rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
      style={{ background: "#DC2626" }}
    />
  );
}
