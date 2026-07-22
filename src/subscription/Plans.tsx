import { useState, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  showErrorToast,
  showPaymentError,
  showValidationWarning,
} from "@/shared/utils/toastConfig";
import {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionStatusQuery,
  useInitializeSubscriptionPaymentMutation,
} from "@/subscription/subscriptionApi";
import type { SubscriptionPlan } from "./subscriptionApi";
import { sseService } from "@/shared/services/sseService";
import { PageLoadingState } from "@/shared/components";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  CheckCircle2,
  Star,
  Trophy,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function Plans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: plansData,
    isLoading: plansLoading,
    error,
  } = useGetSubscriptionPlansQuery();
  const {
    data: subscriptionData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useGetUserSubscriptionStatusQuery();
  const [initializePayment] = useInitializeSubscriptionPaymentMutation();

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
        refetchStatus();
      };

      const handleSubscriptionExpired = () => {
        refetchStatus();
      };

      // Set up SSE listeners
      unsubscribeUpdate = sseService.onSubscriptionUpdate(handleSubscriptionUpdate);
      unsubscribeExpired = sseService.onSubscriptionExpired(handleSubscriptionExpired);
    } catch (error) {
      console.error("Error setting up SSE listeners:", error);
    }

    // Cleanup listeners (NOT disconnecting)
    return () => {
      try {
        if (unsubscribeUpdate) unsubscribeUpdate();
        if (unsubscribeExpired) unsubscribeExpired();
      } catch (error) {
        console.error("Error cleaning up SSE listeners:", error);
      }
    };
  }, [user?.id, refetchStatus]);

  useEffect(() => {
    refetchStatus();
  }, [refetchStatus]);

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      showValidationWarning("Please select a plan first");
      return;
    }

    if (!user || !user.phoneNumber) {
      showErrorToast("User information not found", "User Information Missing");
      return;
    }

    try {
      setIsProcessing(true);

      const response = await initializePayment({
        email: `${user.phoneNumber}@tuabi.com`,
        amount: selectedPlan.amount,
        planId: selectedPlan.id.toString(),
        currency: "GHS",
      }).unwrap();

      if (!response.status || !response.data.reference) {
        showPaymentError("Failed to initialize payment");
        setIsProcessing(false);
        return;
      }

      const paymentUrl = response.data.authorization_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showPaymentError("Payment initialization failed");
        setIsProcessing(false);
      }
    } catch (error: any) {
      setIsProcessing(false);
      showPaymentError(error?.data?.message || "Failed to process payment");
    }
  };

  const isLoaderVisible = plansLoading || statusLoading || isProcessing;

  if (isLoaderVisible) {
    return <PageLoadingState title="Subscription Plans" />;
  }

  const activePlan =
    subscriptionData?.data?.currentPlan &&
    subscriptionData?.data?.status !== "expired"
      ? subscriptionData.data.currentPlan
      : null;

  const getPlanIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("premium")) {
      return <Trophy className="h-6 w-6 text-warning" />;
    }
    if (lower.includes("yearly")) {
      return <Star className="h-6 w-6 text-primary" />;
    }
    return <Sparkles className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your business and unlock every feature.
        </p>
      </div>

      {/* Current Subscription Status */}
      {activePlan && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Active Subscription
              </h3>
              <p className="text-sm text-muted-foreground">
                {activePlan.plan.name}
              </p>
              {subscriptionData?.data?.subscriptionExpiresAt && (
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>
                    Expires:{" "}
                    {new Date(
                      subscriptionData.data.subscriptionExpiresAt
                    ).toLocaleDateString()}
                  </span>
                  {subscriptionData?.data?.daysRemaining && (
                    <span>
                      ({subscriptionData.data.daysRemaining} days remaining)
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-lg text-destructive">
              Failed to load subscription plans
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plansData?.data?.map((plan) => {
            const isCurrentPlan =
              subscriptionData?.data?.currentPlan?.plan.id === plan.id &&
              subscriptionData?.data?.status !== "expired";
            const isPopular =
              plan.name.toLowerCase().includes("premium") ||
              plan.name.toLowerCase().includes("yearly");
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-shadow",
                  isPopular && "border-primary ring-2 ring-primary",
                  isCurrentPlan &&
                    !isPopular &&
                    "border-success ring-2 ring-success",
                  isSelected && "shadow-md"
                )}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-success text-success-foreground">
                    Current Plan
                  </Badge>
                )}

                {/* Plan Header */}
                <CardHeader className="items-center text-center">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    {getPlanIcon(plan.name)}
                    <h3 className="text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    ₵{plan.amount.toLocaleString()}
                  </div>
                </CardHeader>

                <Separator />

                {/* Plan Features */}
                <CardContent className="flex-1 space-y-3 pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm text-foreground">
                      {plan.duration === 30
                        ? "Monthly billing"
                        : plan.duration === 365
                        ? "Annual billing"
                        : `${plan.duration}-day plan`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm text-foreground">
                      {plan.isActive ? "Active plan" : "Inactive plan"}
                    </span>
                  </div>
                </CardContent>

                {/* Action Button */}
                <CardFooter>
                  <Button
                    onClick={() => handlePlanSelection(plan)}
                    disabled={isCurrentPlan || isProcessing}
                    variant={isSelected ? "default" : "secondary"}
                    className="w-full"
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : isSelected
                      ? "✓ Selected"
                      : plan.amount === 0
                      ? "Get Started"
                      : "Upgrade Now"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Subscribe Button */}
      {selectedPlan && (
        <div className="text-center">
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing}
            size="lg"
            className="px-8 text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              `Subscribe for ₵${selectedPlan?.amount.toLocaleString()}`
            )}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            You will be redirected to a secure payment page
          </p>
        </div>
      )}
    </div>
  );
}
