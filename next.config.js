import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import("next").NextConfig} */
const config = {
  // Prevent webpack from bundling ws — it needs to load its native binaries at runtime
  serverExternalPackages: ["ws", "@neondatabase/serverless"],
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "uploadthing.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default withNextIntl(config);
