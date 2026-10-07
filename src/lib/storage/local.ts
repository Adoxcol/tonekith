import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectStorage, PutObjectInput, PutObjectResult } from "./types";

export class LocalObjectStorage implements ObjectStorage {
  constructor(
    private readonly rootDir: string,
    private readonly publicBasePath = "/api/media",
  ) {}

  private resolve(key: string) {
    const safe = key.replace(/^\/+/, "").replace(/\.\./g, "");
    return path.join(this.rootDir, safe);
  }

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    const full = this.resolve(input.key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, input.body);
    return { key: input.key, url: this.getUrl(input.key) };
  }

  getUrl(key: string): string {
    return `${this.publicBasePath}/${key.replace(/^\/+/, "")}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolve(key));
    } catch {
      // ignore missing
    }
  }

  async getBuffer(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }
}
