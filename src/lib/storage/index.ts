import { getEnv } from "@/lib/env";
import { LocalObjectStorage } from "./local";
import { S3ObjectStorage } from "./s3";
import type { ObjectStorage } from "./types";

let storage: ObjectStorage | null = null;

export function getStorage(): ObjectStorage {
  if (storage) return storage;
  const env = getEnv();
  if (env.STORAGE_DRIVER === "s3") {
    if (
      !env.S3_BUCKET ||
      !env.S3_ACCESS_KEY_ID ||
      !env.S3_SECRET_ACCESS_KEY ||
      !env.S3_PUBLIC_URL
    ) {
      throw new Error("S3 storage selected but S3_* env vars are incomplete");
    }
    storage = new S3ObjectStorage(env.S3_BUCKET, env.S3_PUBLIC_URL, {
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    });
  } else {
    storage = new LocalObjectStorage(env.LOCAL_STORAGE_DIR);
  }
  return storage;
}

export * from "./types";
