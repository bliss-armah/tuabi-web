import { useEffect, useState, useCallback } from 'react';
import { useGetUnreadCountQuery, notificationsApi } from '@/notifications/notificationsApi';
import { useAppDispatch } from '@/shared/store';
import { useAuth } from '@/shared/hooks/useAuth';

interface NotificationState {
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAuth();

  // Skip notification queries until user is properly loaded and cookies are ready
  const shouldSkipQuery = authLoading || !user?.id;

  // Get initial data from API
  const {
    data: unreadData,
    isLoading,
    error: apiError,
    refetch: refetchUnreadCount
  } = useGetUnreadCountQuery(undefined, {
    skip: shouldSkipQuery,
  });

  // Local state for real-time updates
  const [localState, setLocalState] = useState<NotificationState>({
    unreadCount: 0,
    loading: true,
    error: null
  });

  // Update local state when API data changes
  useEffect(() => {
    if (unreadData?.data?.count !== undefined) {
      setLocalState(prev => ({
        ...prev,
        unreadCount: unreadData.data.count,
        loading: false
      }));
    }
  }, [unreadData]);

  // Update loading state
  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      loading: isLoading
    }));
  }, [isLoading]);

  // Update error state
  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      error: apiError ? 'Failed to load notifications' : null
    }));
  }, [apiError]);

  // Handle new notification created
  const handleNotificationCreated = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1
    }));

    // Invalidate RTK Query cache to sync data
    dispatch(notificationsApi.util.invalidateTags(['NotificationStats', 'Notification']));
  }, [dispatch]);

  // Handle notification marked as read
  const handleNotificationRead = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));

    dispatch(notificationsApi.util.invalidateTags(['NotificationStats', 'Notification']));
  }, [dispatch]);

  // Handle notification deleted
  const handleNotificationDeleted = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));

    dispatch(notificationsApi.util.invalidateTags(['NotificationStats', 'Notification']));
  }, [dispatch]);

  // Handle bulk read operations
  const handleBulkRead = useCallback((event: CustomEvent) => {
    const data = event.detail;
    const count = data.ids?.length || 0;

    setLocalState(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - count)
    }));

    dispatch(notificationsApi.util.invalidateTags(['NotificationStats', 'Notification']));
  }, [dispatch]);

  // Handle all notifications read
  const handleAllRead = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      unreadCount: 0
    }));

    dispatch(notificationsApi.util.invalidateTags(['NotificationStats', 'Notification']));
  }, [dispatch]);

  // Handle general refresh requests
  const handleRefreshNotifications = useCallback(async () => {
    await refetchUnreadCount();
  }, [refetchUnreadCount]);

  // Set up SSE event listeners
  useEffect(() => {
    // Real-time notification events
    window.addEventListener('notificationCreated', handleNotificationCreated as EventListener);
    window.addEventListener('notificationRead', handleNotificationRead as EventListener);
    window.addEventListener('notificationDeleted', handleNotificationDeleted as EventListener);
    window.addEventListener('notificationsBulkRead', handleBulkRead as EventListener);
    window.addEventListener('allNotificationsRead', handleAllRead as EventListener);

    // General refresh events
    window.addEventListener('refreshNotifications', handleRefreshNotifications as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('notificationCreated', handleNotificationCreated as EventListener);
      window.removeEventListener('notificationRead', handleNotificationRead as EventListener);
      window.removeEventListener('notificationDeleted', handleNotificationDeleted as EventListener);
      window.removeEventListener('notificationsBulkRead', handleBulkRead as EventListener);
      window.removeEventListener('allNotificationsRead', handleAllRead as EventListener);
      window.removeEventListener('refreshNotifications', handleRefreshNotifications as EventListener);
    };
  }, [
    handleNotificationCreated,
    handleNotificationRead,
    handleNotificationDeleted,
    handleBulkRead,
    handleAllRead,
    handleRefreshNotifications
  ]);

  // Force refresh from API (useful for debugging)
  const forceRefresh = useCallback(async () => {
    await refetchUnreadCount();
  }, [refetchUnreadCount]);

  return {
    unreadCount: localState.unreadCount,
    loading: localState.loading,
    error: localState.error,
    forceRefresh,

    // Original RTK Query data for debugging
    _debug: {
      apiCount: unreadData?.data?.count || 0,
      localCount: localState.unreadCount,
      isLoading,
      apiError
    }
  };
};

export default useNotifications;