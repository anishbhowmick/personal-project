import { Heart, Pin, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import type { DashboardItem } from "../types";

interface Props {
  item: DashboardItem;
  onOpen: (item: DashboardItem) => void;
  onFavorite: (item: DashboardItem) => void;
  onPin: (item: DashboardItem) => void;
  onDelete: (item: DashboardItem) => void;
  dragProps?: HTMLAttributes<HTMLDivElement>;
}

export const DashboardCard = ({ item, onOpen, onFavorite, onPin, onDelete, dragProps }: Props) => (
  <motion.article
    layout
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.99 }}
    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-lg"
  >
    <div className="flex h-40 w-full items-center justify-center bg-black/30 p-3">
      <img
        src={item.thumbnail || item.favicon || "https://placehold.co/640x360/16161f/ffffff?text=Link"}
        alt={item.title}
        loading="lazy"
        className="h-full w-full rounded-lg object-contain"
      />
    </div>
    <div className="space-y-2 p-4 text-white">
      <h3 className="line-clamp-1 text-lg font-semibold">{item.title}</h3>
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <div className="cursor-grab rounded-full p-2 text-white/60 hover:bg-white/10 active:cursor-grabbing" title="Drag to reorder" {...dragProps}>
            :::
          </div>
          <button className="rounded-full p-2 hover:bg-white/10" onClick={() => onFavorite(item)}><Heart size={16} className={item.favorite ? "fill-rose-500 text-rose-500" : "text-white/80"} /></button>
          <button className="rounded-full p-2 hover:bg-white/10" onClick={() => onPin(item)}><Pin size={16} className={item.pinned ? "fill-cyan-400 text-cyan-400" : "text-white/80"} /></button>
          <button className="rounded-full p-2 hover:bg-white/10" onClick={() => onDelete(item)}><Trash2 size={16} className="text-white/80" /></button>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium" onClick={() => onOpen(item)}>
          Open <ExternalLink size={14} />
        </button>
      </div>
    </div>
  </motion.article>
);
