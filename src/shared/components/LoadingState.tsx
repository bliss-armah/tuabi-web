import LoadingSpinner from "./LoadingSpinner";
import { cn } from "@/shared/utils/utils";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "inline" | "page" | "card";
  className?: string;
}

export default function LoadingState({
  message = "Loading...",
  size = "medium",
  variant = "card",
  className,
}: LoadingStateProps) {
  const baseClasses = "flex items-center justify-center";

  const variantClasses = {
    inline: "space-x-2",
    card: "flex-col space-y-4 py-12",
    page: "min-h-screen flex-col space-y-4",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <LoadingSpinner size={size} />
      {variant !== "inline" && (
        <p className={cn("text-text-secondary", textSizeClasses[size])}>
          {message}
        </p>
      )}
      {variant === "inline" && (
        <span className={cn("text-text-secondary", textSizeClasses[size])}>
          {message}
        </span>
      )}
    </div>
  );
}