/** 用户实体。 */
export interface User {
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  role?: number;
  created_at?: string;
  updated_at?: string;
}

/** 登录请求体。 */
export interface LoginPayload {
  username: string;
  password: string;
}

/** 注册请求体。 */
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

/** 登录响应。 */
export interface LoginResult {
  token: string;
  user: User;
}
