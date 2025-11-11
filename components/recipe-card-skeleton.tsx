export function RecipeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 w-full bg-gray-200 dark:bg-zinc-700" />
      
      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-20" />
          <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-14" />
        </div>
      </div>
    </div>
  );
}

