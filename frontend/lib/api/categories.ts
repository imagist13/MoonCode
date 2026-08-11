import { getJSON } from "./client";
import type { Category } from "@/types/category";

export function listCategories() {
  return getJSON<Category[]>("/categories");
}

export function getCategoryBySlug(slug: string) {
  return getJSON<Category>(`/categories/slug/${encodeURIComponent(slug)}`);
}