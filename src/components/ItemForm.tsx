import { useState } from "react";
import type { DashboardItemInput } from "../types";

interface Props {
  onSubmit: (item: DashboardItemInput) => Promise<void>;
}

export const ItemForm = ({ onSubmit }: Props) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <h3 className="mb-3 text-lg font-semibold">Add Website</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="rounded-lg bg-black/30 p-2" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className="rounded-lg bg-black/30 p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <button
        className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 font-medium"
        onClick={() => onSubmit({ url, title })}
      >
        Save
      </button>
    </div>
  );
};
