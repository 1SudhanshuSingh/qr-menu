import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Extract hostname from AWS_ENDPOINT_URL_S3 so next/image can load from it
const s3Hostname = process.env.AWS_ENDPOINT_URL_S3
  ? new URL(process.env.AWS_ENDPOINT_URL_S3).hostname
  : null;

/** @type {import("next").NextConfig} */
const config = {
  // Prevent webpack from bundling ws — it needs to load its native binaries at runtime
  serverExternalPackages: ["ws", "@neondatabase/serverless"],
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "uploadthing.com" },
      { hostname: "images.unsplash.com" },
      ...(s3Hostname ? [{ hostname: s3Hostname }] : []),
    ],
  },
};

export default withNextIntl(config);
