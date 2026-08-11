export interface User {
  id: number;
  username: string;
  nickname?: string | null;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
  role: "admin" | "editor" | "user";
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt?: string;
}