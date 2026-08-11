import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface SessionState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: "moon-session" }
  )
);