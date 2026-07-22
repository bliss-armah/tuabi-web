import { useGetUserSubscriptionStatusQuery } from "@/subscription/subscriptionApi";

export const useSubscription = () => {
  const {
    data: subscriptionData,
    isLoading,
    error,
    refetch,
  } = useGetUserSubscriptionStatusQuery();

  const subscription = subscriptionData?.data;

  // Billing-exempt workspaces are never treated as expired.
  const hasExpired =
    !subscription?.isExempt &&
    (!subscription?.subscriptionExpiresAt ||
      new Date(subscription.subscriptionExpiresAt) < new Date());

  // Calculate days remaining
  const daysRemaining = subscription?.subscriptionExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.subscriptionExpiresAt).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return {
    subscription,
    isLoading,
    error,
    hasExpired,
    daysRemaining,
    refetch,
    isSubscribed: !hasExpired,
  };
};
