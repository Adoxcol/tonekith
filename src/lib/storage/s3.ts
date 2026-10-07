import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { ObjectStorage, PutObjectInput, PutObjectResult } from "./types";

export class S3ObjectStorage implements ObjectStorage {
  private client: S3Client;

  constructor(
    private readonly bucket: string,
    private readonly publicUrl: string,
    config: {
      endpoint?: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    },
  ) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
    return { key: input.key, url: this.getUrl(input.key) };
  }

  getUrl(key: string): string {
    return `${this.publicUrl.replace(/\/$/, "")}/${key.replace(/^\/+/, "")}`;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
