import { db } from "~/server/db";

export default async function QRPage() {
  const restaurant = await db.restaurant.findFirst({ where: { slug: "alma-portuguesa" } });
  if (!restaurant) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://alma-portuguesa.netlify.app";
  const menuUrl = `${baseUrl}/pt/m/${restaurant.slug}`;

  const qrFiles = [
    { label: "SVG (vector, print-ready)", file: `${restaurant.slug}.svg`, desc: "Best for Illustrator, Canva, or any size printing" },
    { label: "PNG (1200×1200px)", file: `${restaurant.slug}.png`, desc: "High-res raster for posters, table cards, flyers" },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          QR Code
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Print-ready QR codes for your restaurant. Encodes:{" "}
          <code className="rounded px-1 py-0.5 text-xs" style={{ background: "#F0EBE3" }}>
            {menuUrl}
          </code>
        </p>
      </div>

      {/* Preview */}
      <div
        className="flex flex-col items-center gap-6 rounded-2xl p-8 sm:flex-row"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        {/* QR preview */}
        <div
          className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "#1A3A6C" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/qr/${restaurant.slug}.svg`}
            alt="QR code"
            width={180}
            height={180}
            className="rounded-xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold" style={{ color: "#1C1917" }}>
            {restaurant.name}
          </p>
          <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
            Points to your live menu. Never needs reprinting — the URL is permanent.
          </p>

          <div className="mt-4 space-y-2">
            {qrFiles.map(({ label, file, desc }) => (
              <a
                key={file}
                href={`/qr/${file}`}
                download={file}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                style={{ background: "#F7F5F2", border: "1px solid #E8E0D8", color: "#1C1917" }}
              >
                <span className="text-xl">⬇️</span>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs" style={{ color: "#78716C" }}>{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Re-generate instructions */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#F0EBE3", border: "1px solid #E8E0D8" }}
      >
        <p className="text-sm font-medium" style={{ color: "#1C1917" }}>
          To regenerate the QR (after changing your production URL):
        </p>
        <code
          className="mt-2 block rounded-lg p-3 text-xs"
          style={{ background: "#1C1917", color: "#FAF7F2" }}
        >
          pnpm qr:generate
        </code>
        <p className="mt-2 text-xs" style={{ color: "#78716C" }}>
          This creates new SVG and PNG files in <code>public/qr/</code>
        </p>
      </div>
    </div>
  );
}
