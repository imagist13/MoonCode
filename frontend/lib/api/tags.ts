import { getJSON } from "./client";
import type { Tag } from "@/types/tag";

export function listTags() {
  return getJSON<Tag[]>("/tags");
}