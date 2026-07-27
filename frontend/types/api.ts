/**
 * 后端统一响应包装。
 * 与 Go 后端 `{ code, message, data }` 结构对齐。
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页响应通用结构。 */
export interface Paginated<T> {
  list: T[];
  total: number;
}

/** 分页查询通用参数。 */
export interface PageQuery {
  page?: number;
  pageSize?: number;
}
