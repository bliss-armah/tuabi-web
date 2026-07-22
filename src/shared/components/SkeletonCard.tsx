import { cn } from "@/shared/utils/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showLargeLine?: boolean;
}

export default function SkeletonCard({
  className,
  lines = 2,
  showLargeLine = true,
}: SkeletonCardProps) {
  return (
    <div className={cn("card animate-pulse", className)}>
      {/* First line - typically smaller (like titles) */}
      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>

      {/* Large line - typically for main content/numbers */}
      {showLargeLine && (
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
      )}

      {/* Additional lines */}
      {lines > 2 && Array.from({ length: lines - 2 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-muted rounded mb-3",
            index % 2 === 0 ? "w-3/4" : "w-1/2"
          )}
        />
      ))}
    </div>
  );
}