import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SecurityState {
  pinCode: string;
  locked: boolean;
  quickHide: boolean;
  setPinCode: (pin: string) => void;
  unlock: (pin?: string) => boolean;
  lock: () => void;
  toggleQuickHide: () => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      pinCode: "",
      locked: false,
      quickHide: false,
      setPinCode: (pinCode) => set({ pinCode }),
      unlock: (pin) => {
        const expected = get().pinCode;
        if (!expected || expected === pin) {
          set({ locked: false });
          return true;
        }
        return false;
      },
      lock: () => set({ locked: true }),
      toggleQuickHide: () => set((state) => ({ quickHide: !state.quickHide })),
    }),
    {
      name: "dashboard-security",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ pinCode: state.pinCode }),
    },
  ),
);
