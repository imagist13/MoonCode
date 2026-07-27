import { apiFetch } from "./client";
import type {
  LoginPayload,
  LoginResult,
  RegisterPayload,
  User,
} from "@/types/user";

/** 用户相关 API。 */
export const users = {
  login: (payload: LoginPayload) =>
    apiFetch<LoginResult>("/users/login", { method: "POST", body: payload }),
  register: (payload: RegisterPayload) =>
    apiFetch<User>("/users/register", { method: "POST", body: payload }),
  profile: (token: string) =>
    apiFetch<User>("/users/profile", { token }),
  logout: (token: string) =>
    apiFetch<null>("/users/logout", { method: "POST", token }),
  updateProfile: (payload: Partial<User>, token: string) =>
    apiFetch<User>("/users/profile", { method: "PUT", body: payload, token }),
};
