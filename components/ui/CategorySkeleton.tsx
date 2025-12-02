export function CategorySkeleton() {
  return (
    <div className="w-full p-4 rounded-xl bg-purple-dark/30 border-2 border-purple-base/20 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        {/* Name skeleton */}
        <div className="h-5 bg-purple-base/20 rounded-md w-24" />
        
        {/* Checkbox skeleton */}
        <div className="w-6 h-6 rounded-md bg-purple-base/20" />
      </div>
    </div>
  );
}

interface CategorySkeletonGridProps {
  count?: number;
}

export function CategorySkeletonGrid({ count = 6 }: CategorySkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
}
