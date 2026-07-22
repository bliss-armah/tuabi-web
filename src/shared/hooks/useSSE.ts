import { useEffect, useCallback, useState } from 'react';
import { sseService } from '@/shared/services/sseService';

/**
 * React hook for Server-Sent Events (SSE) integration
 *
 * Usage:
 * ```typescript
 * const useMyComponent = () => {
 *   useSSE('reminderDue', (data) => {
 *     console.log('Reminder due:', data);
 *   }, []);
 *
 *   useSSE('paymentReceived', handlePaymentReceived, [dependency]);
 * };
 * ```
 */

export const useSSE = (
  eventType: string,
  callback: (data: any) => void,
  dependencies: any[] = []
) => {
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    if (!eventType || typeof memoizedCallback !== 'function') {
      console.warn('useSSE: eventType and callback are required');
      return;
    }

    // Add event listener
    const unsubscribe = sseService.addEventListener(eventType, memoizedCallback);

    return () => {
      // Cleanup on unmount or dependency change
      unsubscribe();
    };
  }, [eventType, memoizedCallback]);
};

/**
 * Hook for multiple SSE event listeners
 *
 * Usage:
 * ```typescript
 * useSSEMultiple([
 *   { eventType: 'reminderDue', callback: handleReminderDue },
 *   { eventType: 'paymentReceived', callback: handlePaymentReceived }
 * ], [dependency1, dependency2]);
 * ```
 */
export const useSSEMultiple = (
  listeners: Array<{ eventType: string; callback: (data: any) => void }>,
  dependencies: any[] = []
) => {
  const memoizedListeners = useCallback(() => listeners, dependencies);

  useEffect(() => {
    const unsubscribeFunctions: Array<() => void> = [];

    const currentListeners = memoizedListeners();

    currentListeners.forEach(({ eventType, callback }) => {
      if (eventType && typeof callback === 'function') {
        const unsubscribe = sseService.addEventListener(eventType, callback);
        unsubscribeFunctions.push(unsubscribe);
      }
    });

    return () => {
      // Cleanup all listeners
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [memoizedListeners]);
};

/**
 * Hook to get SSE connection status
 */
export const useSSEConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(sseService.isConnected());
    };

    // Check initial status
    checkConnection();

    // Set up interval to check connection status
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return isConnected;
};

/**
 * Hook for subscription-related SSE events
 * Convenience hook that combines all subscription events
 */
export const useSSESubscription = (
  onUpdate?: (data: any) => void,
  onExpiring?: (data: any) => void,
  onExpired?: (data: any) => void,
  dependencies: any[] = []
) => {
  useSSEMultiple([
    ...(onUpdate ? [{ eventType: 'subscriptionUpdate', callback: onUpdate }] : []),
    ...(onExpiring ? [{ eventType: 'trialExpiring', callback: onExpiring }] : []),
    ...(onExpired ? [{ eventType: 'subscriptionExpired', callback: onExpired }] : []),
  ], dependencies);
};

/**
 * Hook for reminder-related SSE events
 * Convenience hook that combines all reminder events
 */
export const useSSEReminders = (
  onDue?: (data: any) => void,
  onOverdue?: (data: any) => void,
  onCreate?: (data: any) => void,
  dependencies: any[] = []
) => {
  useSSEMultiple([
    ...(onDue ? [{ eventType: 'reminderDue', callback: onDue }] : []),
    ...(onOverdue ? [{ eventType: 'reminderOverdue', callback: onOverdue }] : []),
    ...(onCreate ? [{ eventType: 'reminderCreated', callback: onCreate }] : []),
  ], dependencies);
};

/**
 * Hook for payment-related SSE events
 * Convenience hook that combines all payment events
 */
export const useSSEPayments = (
  onReceived?: (data: any) => void,
  onOverdue?: (data: any) => void,
  dependencies: any[] = []
) => {
  useSSEMultiple([
    ...(onReceived ? [{ eventType: 'paymentReceived', callback: onReceived }] : []),
    ...(onOverdue ? [{ eventType: 'paymentOverdue', callback: onOverdue }] : []),
  ], dependencies);
};

export default useSSE;