import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserSubscriptionStatusQuery } from "./subscriptionApi";
import { sseService } from "@/shared/services/sseService";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  XCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export default function SubscriptionStatus({
  showUpgradeButton = true,
  compact = false,
}: SubscriptionStatusProps) {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();

  const {
    data: subscriptionResponse,
    isLoading,
    error,
    refetch,
  } = useGetUserSubscriptionStatusQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  // Listen for real-time subscription updates via SSE
  useEffect(() => {
    if (!user?.id) return;

    // Only set up SSE listeners if the service is connected
    if (!sseService.isConnected()) {
      return;
    }

    let unsubscribeUpdate: (() => void) | undefined;
    let unsubscribeExpired: (() => void) | undefined;

    try {
      const handleSubscriptionUpdate = () => {
        // Refetch subscription status when we get real-time updates
        refetch();
      };

      const handleSubscriptionExpired = () => {
        // Refetch subscription status when subscription expires
        refetch();
      };

      // Set up SSE listeners
      unsubscribeUpdate = sseService.onSubscriptionUpdate(
        handleSubscriptionUpdate
      );
      unsubscribeExpired = sseService.onSubscriptionExpired(
        handleSubscriptionExpired
      );
    } catch (error) {
      console.error("Error setting up SSE listeners:", error);
    }

    // Cleanup listeners
    return () => {
      try {
        if (unsubscribeUpdate) unsubscribeUpdate();
        if (unsubscribeExpired) unsubscribeExpired();
      } catch (error) {
        console.error("Error cleaning up SSE listeners:", error);
      }
    };
  }, [user?.id, refetch]);

  const handleUpgrade = () => {
    navigate("/plans");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Loading subscription status...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error || !subscriptionResponse?.success) {
    // For subscription errors, show the subscription card instead of error
    // Continue to render the subscription card below
  }

  // Extract the actual subscription data
  const subscriptionData = subscriptionResponse?.data;
  const isSubscribed = subscriptionData?.isActive || false;
  const planName = subscriptionData?.planName;
  const expirationDate = subscriptionData?.expiresAt;
  const daysRemaining = subscriptionData?.daysRemaining || 0;

  // Check if subscription has expired
  const hasExpired = expirationDate && new Date(expirationDate) < new Date();

  // Determine actual subscription status
  const isActiveSubscription = isSubscribed && !hasExpired;

  if (compact) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between">
          {isActiveSubscription ? (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-foreground">
                Active - {planName || "Unknown Plan"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-foreground">
                {hasExpired ? "Expired" : "No Active Subscription"}
              </span>
            </div>
          )}

          {/* Compact refresh button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => {
              await Promise.all([refetch(), refreshUserData()]);
            }}
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Subscription Status</CardTitle>
        {isActiveSubscription && (
          <Badge className="bg-success text-success-foreground">Active</Badge>
        )}
        {hasExpired && <Badge variant="destructive">Expired</Badge>}
      </CardHeader>

      <CardContent>
        {isActiveSubscription ? (
          <div className="space-y-4">
            {planName && (
              <div className="rounded-lg bg-muted p-4">
                <span className="font-medium text-foreground">
                  {planName} Plan
                </span>
              </div>
            )}

            {expirationDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Subscription expires:</span>
                </div>
                <div className="text-foreground">
                  <span>{formatDate(expirationDate)}</span>
                  <div className="mt-1 text-sm font-medium text-primary">
                    {daysRemaining} days remaining
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              {hasExpired ? (
                <div className="mb-2 flex items-center justify-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Your subscription has expired
                  </span>
                </div>
              ) : (
                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">No active subscription</span>
                </div>
              )}

              {hasExpired && expirationDate && (
                <p className="mb-2 text-sm text-muted-foreground">
                  Expired on {formatDate(expirationDate)}
                </p>
              )}

              {planName && hasExpired && (
                <p className="mb-2 text-sm text-muted-foreground">
                  Previous plan: {planName}
                </p>
              )}

              <p className="text-muted-foreground">
                {hasExpired
                  ? "Renew your subscription to continue accessing all features"
                  : "Upgrade to access all features and unlimited debtors"}
              </p>
            </div>

            {showUpgradeButton && (
              <Button onClick={handleUpgrade} className="w-full">
                {hasExpired ? "Renew Subscription" : "Upgrade Now"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {/* Manual refresh button */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={async () => {
                  await Promise.all([refetch(), refreshUserData()]);
                }}
                className="h-auto p-0 text-sm font-medium"
              >
                Refresh Status
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
