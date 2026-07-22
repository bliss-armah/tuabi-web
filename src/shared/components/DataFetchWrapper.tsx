import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

interface DataFetchWrapperProps {
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  loadingVariant?: "inline" | "page" | "card";
  errorVariant?: "inline" | "page" | "card";
  className?: string;
  children: React.ReactNode;
}

export default function DataFetchWrapper({
  isLoading,
  error,
  onRetry,
  loadingMessage,
  errorTitle,
  errorMessage,
  loadingVariant = "card",
  errorVariant = "card",
  className,
  children,
}: DataFetchWrapperProps) {
  if (isLoading) {
    return (
      <LoadingState
        message={loadingMessage}
        variant={loadingVariant}
        className={className}
      />
    );
  }

  if (error) {
    // Extract error message from different error formats
    const extractErrorMessage = (err: any): string => {
      if (typeof err === "string") return err;
      if (err?.message) return err.message;
      if (err?.data?.message) return err.data.message;
      if (err?.error) return err.error;
      return "An unexpected error occurred";
    };

    return (
      <ErrorState
        title={errorTitle}
        message={errorMessage || extractErrorMessage(error)}
        variant={errorVariant}
        onAction={onRetry}
        className={className}
      />
    );
  }

  return <>{children}</>;
}