export type ThemeMode = "dark" | "light";

export interface DashboardItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  favicon?: string;
  tags: string[];
  category: string;
  favorite: boolean;
  pinned: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  lastVisitedAt?: number;
}

export interface DashboardItemInput {
  title: string;
  url: string;
}

export interface UserSettings {
  quickHideEnabled: boolean;
  autoLockMinutes: number;
  theme: ThemeMode;
  accent: string;
  pinEnabled: boolean;
}
