export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type PutObjectResult = {
  key: string;
  url: string;
};

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<PutObjectResult>;
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
  getBuffer?(key: string): Promise<Buffer>;
}
