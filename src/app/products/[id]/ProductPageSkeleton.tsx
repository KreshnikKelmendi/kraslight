function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`}
      aria-hidden
    />
  );
}

export default function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-label="Duke ngarkuar produktin">
      <div className="mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Images column */}
          <div className="space-y-3 sm:space-y-6">
            <SkeletonBlock className="aspect-square w-full" />
            <div className="flex gap-2 sm:grid sm:grid-cols-5 sm:gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="aspect-square w-14 h-14 sm:w-full sm:h-auto shrink-0" />
              ))}
            </div>
            <div className="hidden lg:block space-y-3 p-4 bg-gray-50 rounded-xl">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-32 w-full rounded-lg" />
            </div>
          </div>

          {/* Info column */}
          <div className="space-y-3 sm:space-y-6">
            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-9 sm:h-12 w-full max-w-md" />
              <SkeletonBlock className="h-4 w-32" />
            </div>

            <SkeletonBlock className="h-14 w-full" />

            <SkeletonBlock className="h-20 w-full" />

            <div className="space-y-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-36" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <SkeletonBlock className="h-12 w-32" />
              <SkeletonBlock className="h-12 flex-1 max-w-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
