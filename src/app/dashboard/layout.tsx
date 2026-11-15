import { db } from "~/server/db";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata = { title: "Dashboard — Alma Portuguesa" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const restaurant = await db.restaurant.findFirst({
    where: { slug: "alma-portuguesa" },
  });

  return (
    <TRPCReactProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ fontFamily: "var(--font-body, system-ui), sans-serif" }}
      >
        <Sidebar restaurantName={restaurant?.name ?? "Restaurant"} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden" style={{ background: "#F7F5F2" }}>
          {/* Top bar */}
          <header
            className="flex h-14 flex-shrink-0 items-center justify-between px-6"
            style={{
              background: "white",
              borderBottom: "1px solid #E8E0D8",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "#1C1917" }}>
                {restaurant?.name ?? "Restaurant"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/pt/m/alma-portuguesa"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#E8E0D8", color: "#6B6460" }}
              >
                ↗ Live Menu
              </a>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </TRPCReactProvider>
  );
}
