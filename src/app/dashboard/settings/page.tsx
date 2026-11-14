import { db } from "~/server/db";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Restaurant Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Update your restaurant information — changes appear on the live menu instantly.
        </p>
      </div>
      <SettingsForm restaurant={restaurant} />
    </div>
  );
}
