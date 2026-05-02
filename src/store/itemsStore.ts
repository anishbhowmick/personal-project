import { create } from "zustand";
import localforage from "localforage";
import type { DashboardItem } from "../types";

interface ItemsState {
  items: DashboardItem[];
  loading: boolean;
  search: string;
  sortBy: "name" | "recent" | "favorites";
  setItems: (items: DashboardItem[]) => void;
  setLoading: (loading: boolean) => void;
  setSearch: (value: string) => void;
  setSortBy: (value: "name" | "recent" | "favorites") => void;
  cacheItems: (items: DashboardItem[]) => Promise<void>;
  loadCachedItems: () => Promise<void>;
}

const CACHE_KEY = "dashboard-items-cache";

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],
  loading: true,
  search: "",
  sortBy: "recent",
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  cacheItems: async (items) => {
    await localforage.setItem(CACHE_KEY, items);
  },
  loadCachedItems: async () => {
    const cached = (await localforage.getItem<DashboardItem[]>(CACHE_KEY)) ?? [];
    if (cached.length > 0) {
      set({ items: cached, loading: false });
    }
  },
}));
