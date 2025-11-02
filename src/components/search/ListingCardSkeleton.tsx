export const ListingCardSkeleton = () => {
  return (
    <div className="block group animate-fade-in">
      <div className="space-y-3">
        {/* Image skeleton with shimmer */}
        <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" 
               style={{ 
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 2s infinite'
               }} 
          />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2 px-1">
          {/* Room type label */}
          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
          
          {/* Title */}
          <div className="space-y-1.5">
            <div className="h-5 bg-muted rounded w-full animate-pulse" />
            <div className="h-5 bg-muted rounded w-4/5 animate-pulse" />
          </div>
          
          {/* Price */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
