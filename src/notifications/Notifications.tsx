import { useSubscription } from "@/shared/hooks/useSubscription";
import NotificationsList from "@/notifications/NotificationsList";
import SubscriptionLockScreen from "@/subscription/SubscriptionLockScreen";
import { PageLoadingState } from "@/shared/components";
import { useAuth } from "@/shared/hooks/useAuth";

export default function Notifications() {
  useAuth();
  const { hasExpired, isLoading: subscriptionLoading } = useSubscription();

  if (subscriptionLoading) {
    return (
      <PageLoadingState
        title="Notifications"
        skeletonVariant="text"
        gridCols={{ default: 1, md: 1, lg: 1 }}
      />
    );
  }

  if (hasExpired) {
    return <SubscriptionLockScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay on top of reminders, payments, and account updates.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <NotificationsList />
    </div>
  );
}
