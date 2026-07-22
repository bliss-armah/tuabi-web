import { cn } from "@/shared/utils/utils";

interface SkeletonLoaderProps {
  variant?: "text" | "card" | "table" | "custom";
  count?: number;
  className?: string;
  children?: React.ReactNode;
}

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

export default function SkeletonLoader({
  variant = "card",
  count = 1,
  className,
  children,
}: SkeletonLoaderProps) {
  if (variant === "custom" && children) {
    return <div className={className}>{children}</div>;
  }

  const renderSkeleton = () => {
    switch (variant) {
      case "text":
        return (
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-4 w-1/2" />
            <SkeletonLine className="h-4 w-2/3" />
          </div>
        );

      case "table":
        return (
          <div className="card">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <SkeletonLine className="h-4 w-1/4" />
                <SkeletonLine className="h-4 w-1/4" />
                <SkeletonLine className="h-4 w-1/4" />
                <SkeletonLine className="h-4 w-1/4" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <SkeletonLine className="h-6 w-1/4" />
                  <SkeletonLine className="h-6 w-1/4" />
                  <SkeletonLine className="h-6 w-1/4" />
                  <SkeletonLine className="h-6 w-1/4" />
                </div>
              ))}
            </div>
          </div>
        );

      case "card":
      default:
        return (
          <div className="card">
            <div className="space-y-4">
              <SkeletonLine className="h-6 w-3/4" />
              <SkeletonLine className="h-4 w-1/2" />
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-2/3" />
              </div>
              <div className="flex space-x-2 pt-2">
                <SkeletonLine className="h-8 w-16" />
                <SkeletonLine className="h-8 w-20" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? "mb-6" : ""}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}