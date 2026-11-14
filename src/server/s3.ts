import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

export const s3 = new S3Client({
  endpoint: env.AWS_ENDPOINT_URL_S3,
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  // Required for path-style URLs with Neon Object Storage
  forcePathStyle: true,
});

export const BUCKET = env.S3_BUCKET;

/** Returns the public URL for a stored object key. */
export function objectUrl(key: string): string {
  return `${env.AWS_ENDPOINT_URL_S3}/${BUCKET}/${key}`;
}
