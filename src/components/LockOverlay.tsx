interface Props {
  onUnlock: (pin: string) => void;
}

export const LockOverlay = ({ onUnlock }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 text-white">
        <h2 className="mb-2 text-xl font-semibold">Dashboard Locked</h2>
        <p className="mb-4 text-sm text-zinc-200">Enter PIN (if configured) to continue.</p>
        <input className="w-full rounded-lg bg-black/30 p-3" placeholder="PIN" type="password" onChange={(e) => onUnlock(e.target.value)} />
      </div>
    </div>
  );
};
