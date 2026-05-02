export const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-64 animate-pulse rounded-2xl bg-white/10" />
    ))}
  </div>
);
