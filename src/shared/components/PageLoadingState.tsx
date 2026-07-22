import LoadingSpinner from "./LoadingSpinner";
import SkeletonLoader from "./SkeletonLoader";
import { cn } from "@/shared/utils/utils";

interface PageLoadingStateProps {
  title: string;
  showSkeletonCards?: boolean;
  skeletonCount?: number;
  skeletonVariant?: "text" | "card" | "table" | "custom";
  gridCols?: {
    default?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
  headerActions?: React.ReactNode;
  children?: React.ReactNode; // Custom skeleton content
}

export default function PageLoadingState({
  title,
  showSkeletonCards = true,
  skeletonCount = 3,
  skeletonVariant = "card",
  gridCols = { default: 1, md: 2, lg: 3 },
  className,
  headerActions,
  children,
}: PageLoadingStateProps) {
  const gridClasses = cn(
    "grid gap-6",
    `grid-cols-${gridCols.default || 1}`,
    gridCols.md && `md:grid-cols-${gridCols.md}`,
    gridCols.lg && `lg:grid-cols-${gridCols.lg}`
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with title and spinner */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-text">{title}</h1>
        <div className="flex items-center space-x-4">
          {headerActions}
          <LoadingSpinner size="medium" />
        </div>
      </div>

      {/* Custom Skeleton Content or Default Grid */}
      {children ? (
        <div>{children}</div>
      ) : (
        showSkeletonCards && (
          <div className={gridClasses}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonLoader key={index} variant={skeletonVariant} />
            ))}
          </div>
        )
      )}
    </div>
  );
}