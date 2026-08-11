import { api } from "./client";
import type { AuthSession, User } from "@/types/user";

export interface LoginInput {
  username: string;
  password: string;
}
export interface RegisterInput extends LoginInput {
  email: string;
  nickname?: string;
}

export function login(input: LoginInput) {
  return api<AuthSession>("/auth/login", {
    method: "POST",
    body: input,
  });
}
export function register(input: RegisterInput) {
  return api<AuthSession>("/auth/register", {
    method: "POST",
    body: input,
  });
}
export function logout(token: string) {
  return api<void>("/auth/logout", { method: "POST", token });
}
export function me(token: string) {
  return api<User>("/auth/me", { token });
}