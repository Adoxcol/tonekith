import slugify from "slugify";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function normalizeName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}
