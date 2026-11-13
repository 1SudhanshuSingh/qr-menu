import { Cormorant_Garamond, Inter } from "next/font/google";
import "~/styles/globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-body bg-[#FAF7F2] text-[#1C1917] antialiased">
        {children}
      </body>
    </html>
  );
}
