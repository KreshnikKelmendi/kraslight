function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200/80 ${className}`} aria-hidden />
  );
}

export default function ProductPageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-white" aria-busy="true" aria-label="Duke ngarkuar produktin">
      <div className="w-full min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="w-full min-w-0 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div className="hidden min-w-0 lg:grid grid-cols-2 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-[3/4]" />
            ))}
          </div>

          <div className="min-w-0 lg:relative">
            <SkeletonBlock className="lg:hidden mb-8 aspect-[3/4] w-full" />

            <div className="lg:sticky lg:top-28 space-y-6 lg:px-2">
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-6 w-20" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-12" />
                ))}
              </div>
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-px w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
