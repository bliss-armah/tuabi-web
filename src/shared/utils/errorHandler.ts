export interface ErrorInfo {
  shouldShowSubscriptionCard: boolean;
  errorMessage: string;
  isSubscriptionError: boolean;
  isNetworkError: boolean;
}

/**
 * Analyzes an error and determines how it should be handled in the UI
 */
export const analyzeError = (error: any): ErrorInfo => {
  // Default error info
  const defaultErrorInfo: ErrorInfo = {
    shouldShowSubscriptionCard: false,
    errorMessage: "An unexpected error occurred",
    isSubscriptionError: false,
    isNetworkError: false,
  };

  if (!error) {
    return defaultErrorInfo;
  }

  // Check for network errors (RTK Query FETCH_ERROR)
  if (error.status === "FETCH_ERROR" || error.error === "FETCH_ERROR") {
    return {
      shouldShowSubscriptionCard: false,
      errorMessage: "Network error. Please check your connection.",
      isSubscriptionError: false,
      isNetworkError: true,
    };
  }

  // Check for HTTP status codes
  if (error.status) {
    // 403 is typically subscription-related
    if (error.status === 403) {
      return {
        shouldShowSubscriptionCard: true,
        errorMessage: error.data?.message || "Subscription required",
        isSubscriptionError: true,
        isNetworkError: false,
      };
    }

    // Other status codes
    return {
      shouldShowSubscriptionCard: false,
      errorMessage: error.data?.message || `Error ${error.status}`,
      isSubscriptionError: false,
      isNetworkError: false,
    };
  }

  // Check for explicit subscription error indicators in data
  if ("data" in error && error.data) {
    // Check if backend explicitly marked this as a subscription error
    if (
      error.data.subscriptionStatus === "expired" ||
      error.data.subscriptionStatus === "inactive"
    ) {
      return {
        shouldShowSubscriptionCard: true,
        errorMessage:
          error.data.error ||
          error.data.message ||
          "Subscription issue detected",
        isSubscriptionError: true,
        isNetworkError: false,
      };
    }

    // Check for subscription-related error messages (only if very specific)
    if (error.data.message) {
      const message = String(error.data.message).toLowerCase();

      // Only trigger for very specific subscription messages
      const explicitSubscriptionMessages = [
        "subscription expired",
        "trial expired",
        "subscription required",
        "payment required for access",
      ];

      const isExplicitSubscriptionMessage = explicitSubscriptionMessages.some(
        (keyword) => message.includes(keyword)
      );

      if (isExplicitSubscriptionMessage) {
        return {
          shouldShowSubscriptionCard: true,
          errorMessage: error.data.message,
          isSubscriptionError: true,
          isNetworkError: false,
        };
      }
    }
  }

  // Check for explicit subscription error indicators in error field
  if (error.error) {
    const errorMessage = String(error.error).toLowerCase();
    const explicitSubscriptionMessages = [
      "subscription expired",
      "trial expired",
      "subscription required",
      "payment required for access",
    ];

    const isExplicitSubscriptionMessage = explicitSubscriptionMessages.some(
      (keyword) => errorMessage.includes(keyword)
    );

    if (isExplicitSubscriptionMessage) {
      return {
        shouldShowSubscriptionCard: true,
        errorMessage: error.error,
        isSubscriptionError: true,
        isNetworkError: false,
      };
    }
  }

  // Default case - show regular error
  return {
    shouldShowSubscriptionCard: false,
    errorMessage:
      error.data?.message ||
      error.message ||
      error.error ||
      "An unexpected error occurred",
    isSubscriptionError: false,
    isNetworkError: false,
  };
};

/**
 * Quick helper to check if error should show subscription card
 */
export const shouldShowSubscriptionCard = (error: any): boolean => {
  return analyzeError(error).shouldShowSubscriptionCard;
};

/**
 * Get error message from error object
 */
export const getErrorMessage = (error: any): string => {
  return analyzeError(error).errorMessage;
};
