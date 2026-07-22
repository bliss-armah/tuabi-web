import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";
import { cn } from "@/shared/utils/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  variant?: "card" | "page" | "inline";
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  variant = "card",
  actionLabel = "Try Again",
  onAction,
  icon: Icon = AlertTriangle,
  className,
}: ErrorStateProps) {
  const baseClasses = "flex flex-col items-center justify-center text-center";

  const variantClasses = {
    inline: "py-4",
    card: "py-12",
    page: "min-h-screen py-16",
  };

  const iconSizes = {
    inline: "h-8 w-8",
    card: "h-12 w-12",
    page: "h-16 w-16",
  };

  const titleSizes = {
    inline: "text-base",
    card: "text-lg",
    page: "text-xl",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <div className="text-destructive mb-4">
        <Icon className={cn("mx-auto", iconSizes[variant])} />
      </div>

      <h3 className={cn("font-semibold text-text mb-2", titleSizes[variant])}>
        {title}
      </h3>

      <p className="text-text-secondary mb-6 max-w-md">{message}</p>

      {onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}