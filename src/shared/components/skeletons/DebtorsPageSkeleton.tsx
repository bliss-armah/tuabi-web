import { cn } from "@/shared/utils/utils";

interface DebtorsPageSkeletonProps {
  className?: string;
}

export default function DebtorsPageSkeleton({
  className,
}: DebtorsPageSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and View Toggle Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input Skeleton */}
        <div className="relative flex-1">
          <div className="h-12 bg-muted rounded-xl animate-pulse"></div>
        </div>

        {/* View Toggle Skeleton - Desktop Only */}
        <div className="hidden lg:flex items-center">
          <div className="w-20 h-12 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Table/Content Skeleton */}
      <div className="space-y-4">
        {/* Desktop Table View Skeleton */}
        <div className="hidden md:block">
          <div className="card animate-pulse">
            {/* Table Header */}
            <div className="flex space-x-4 p-4 border-b border-border">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex space-x-4 p-4">
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card View Skeleton */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card animate-pulse p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded-full w-16"></div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>

              <div className="flex space-x-2 pt-3">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}