import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const BASE_URL = process.argv[2] ?? "https://alma-portuguesa.netlify.app";
const SLUG = "alma-portuguesa";
const LOCALE = "pt";
const menuUrl = `${BASE_URL}/${LOCALE}/m/${SLUG}`;

const outDir = resolve(process.cwd(), "public/qr");
mkdirSync(outDir, { recursive: true });

async function main() {
  // SVG — vector, print-ready
  const svg = await QRCode.toString(menuUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    color: { dark: "#1A3A6C", light: "#FAF7F2" },
  });
  writeFileSync(`${outDir}/${SLUG}.svg`, svg);

  // PNG — 1200×1200px high-res for print
  await QRCode.toFile(`${outDir}/${SLUG}.png`, menuUrl, {
    type: "png",
    errorCorrectionLevel: "H",
    width: 1200,
    margin: 4,
    color: { dark: "#1A3A6C", light: "#FAF7F2" },
  });

  console.log(`\nQR code generated for:\n  ${menuUrl}\n`);
  console.log(`Files:\n  public/qr/${SLUG}.svg\n  public/qr/${SLUG}.png\n`);
}

main().catch(console.error);
