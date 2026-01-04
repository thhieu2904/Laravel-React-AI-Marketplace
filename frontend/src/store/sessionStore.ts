import { create } from "zustand";

interface SessionState {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isSessionExpired: false,
  setSessionExpired: (expired) => set({ isSessionExpired: expired }),
}));

export default useSessionStore;
