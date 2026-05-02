import { FormEvent, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, LogOut, Search } from "lucide-react";
import { useItemsStore } from "./store/itemsStore";
import { useSecurityStore } from "./store/securityStore";
import { useAutoLock } from "./hooks/useAutoLock";
import { useSwipeAction } from "./hooks/useSwipeAction";
import { DashboardCard } from "./components/DashboardCard";
import { ItemForm } from "./components/ItemForm";
import { LockOverlay } from "./components/LockOverlay";
import { SkeletonGrid } from "./components/SkeletonGrid";
import type { DashboardItem, DashboardItemInput } from "./types";

const SortableCard = ({ item, ...rest }: { item: DashboardItem; onOpen: (item: DashboardItem) => void; onFavorite: (item: DashboardItem) => void; onPin: (item: DashboardItem) => void; onDelete: (item: DashboardItem) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <DashboardCard item={item} {...rest} dragProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { items, loading, search, setItems, setLoading, setSearch, cacheItems, loadCachedItems } = useItemsStore();
  const { locked, quickHide, lock, unlock, toggleQuickHide } = useSecurityStore();

  useAutoLock(lock, 5 * 60 * 1000);
  useSwipeAction(toggleQuickHide);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session", { credentials: "include" });
        if (!response.ok) {
          setIsAuthorized(false);
          setAuthReady(true);
          return;
        }
        const data = (await response.json()) as { authorized?: boolean };
        setIsAuthorized(Boolean(data.authorized));
      } catch {
        setIsAuthorized(false);
      } finally {
        setAuthReady(true);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    void loadCachedItems().finally(() => setLoading(false));
  }, [isAuthorized, loadCachedItems, setLoading]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "h") toggleQuickHide();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") lock();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [lock, toggleQuickHide]);

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase();
    const result = items.filter((item) => item.title.toLowerCase().includes(normalized));

    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }, [items, search]);

  const sensors = useSensors(useSensor(PointerSensor));

  const saveItem = async (draft: DashboardItemInput) => {
    const now = Date.now();
    const domain = (() => {
      try {
        return new URL(draft.url).hostname.replace("www.", "");
      } catch {
        return "general";
      }
    })();
    const item: DashboardItem = {
      ...draft,
      thumbnail: `https://www.google.com/s2/favicons?sz=256&domain_url=${draft.url}`,
      tags: [],
      category: "General",
      favorite: false,
      pinned: false,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      order: items.length,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${draft.url}`,
    };
    if (!item.title.trim()) {
      item.title = domain;
    }
    const next = [...items, item];
    setItems(next);
    await cacheItems(next);
  };

  const toggleFavorite = async (item: DashboardItem) => {
    const next = items.map((entry) => (entry.id === item.id ? { ...entry, favorite: !entry.favorite, updatedAt: Date.now() } : entry));
    setItems(next);
    await cacheItems(next);
  };

  const togglePin = async (item: DashboardItem) => {
    const next = items.map((entry) => (entry.id === item.id ? { ...entry, pinned: !entry.pinned, updatedAt: Date.now() } : entry));
    setItems(next);
    await cacheItems(next);
  };

  const deleteItem = async (item: DashboardItem) => {
    const next = items.filter((entry) => entry.id !== item.id);
    setItems(next);
    await cacheItems(next);
  };

  const openLink = async (item: DashboardItem) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
    const next = items.map((entry) => (entry.id === item.id ? { ...entry, lastVisitedAt: Date.now(), updatedAt: Date.now() } : entry));
    setItems(next);
    await cacheItems(next);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((item) => item.id === active.id);
    const newIndex = filtered.findIndex((item) => item.id === over.id);
    const moved = arrayMove(filtered, oldIndex, newIndex).map((item, index) => ({ ...item, order: index, updatedAt: Date.now() }));

    setItems(moved);
    await cacheItems(moved);
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setIsAuthorized(false);
      setUsername("");
      setPassword("");
    }
  };

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const login = async () => {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
          setAuthError("Authorized personal only.");
          return;
        }
        setIsAuthorized(true);
        setAuthError("");
      } catch {
        setAuthError("Unable to verify access right now.");
      }
    };

    void login();
  };

  if (!authReady) {
    return <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />;
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-20 text-white">
        <form onSubmit={submitAuth} className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h1 className="mb-2 text-2xl font-semibold">Private Access</h1>
          <p className="mb-5 text-sm text-zinc-300">Enter your credentials to continue.</p>
          <div className="space-y-3">
            <input
              className="w-full rounded-lg bg-black/30 p-3"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              className="w-full rounded-lg bg-black/30 p-3"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
            <button className="w-full rounded-lg bg-violet-500 p-3 font-medium">Open Dashboard</button>
            {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className={quickHide ? "pointer-events-none blur-2xl" : ""}>
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 p-4">
            <h1 className="text-xl font-bold">Private Link Dashboard</h1>
            <div className="relative ml-auto min-w-64 flex-1 md:max-w-sm">
              <Search className="pointer-events-none absolute left-2 top-2.5" size={16} />
              <input className="w-full rounded-lg bg-white/10 py-2 pl-8 pr-3" placeholder="Search links by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={logout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-7xl space-y-5 p-4">
          <div>
            <ItemForm onSubmit={saveItem} />
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={filtered.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {filtered.map((item) => (
                    <SortableCard key={item.id} item={item} onOpen={openLink} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteItem} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>

      {locked && <LockOverlay onUnlock={(pin) => unlock(pin)} />}
    </main>
  );
}

export default App;
