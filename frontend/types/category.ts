/** 分类实体。 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  created_at?: string;
  updated_at?: string;
}
