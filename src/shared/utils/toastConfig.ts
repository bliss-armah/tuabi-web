import { toast } from "sonner";

// Toast helpers built on Sonner. Colors come from <Toaster richColors />.
export const showSuccessToast = (message: string, title?: string) => {
  if (title) toast.success(title, { description: message });
  else toast.success(message);
};

export const showErrorToast = (message: string, title?: string) => {
  if (title) toast.error(title, { description: message });
  else toast.error(message);
};

export const showWarningToast = (message: string, title?: string) => {
  if (title) toast.warning(title, { description: message });
  else toast.warning(message);
};

export const showInfoToast = (message: string, title?: string) => {
  if (title) toast.info(title, { description: message });
  else toast.info(message);
};

// Convenience functions for common use cases
export const showPaymentSuccess = (message: string) => {
  showSuccessToast(message, "Payment Successful");
};

export const showPaymentError = (message: string) => {
  showErrorToast(message, "Payment Failed");
};

export const showReminderSuccess = (message: string) => {
  showSuccessToast(message, "Reminder");
};

export const showReminderError = (message: string) => {
  showErrorToast(message, "Reminder Error");
};

export const showValidationWarning = (message: string) => {
  showWarningToast(message, "Validation Required");
};
