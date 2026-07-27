/** 标签实体。 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  count?: number;
  created_at?: string;
  updated_at?: string;
}
