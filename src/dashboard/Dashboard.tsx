import { useState } from "react";
import { useGetDashboardSummaryQuery } from "@/debtors/debtorApi";
import { useSubscription } from "@/shared/hooks/useSubscription";
import SubscriptionLockScreen from "@/subscription/SubscriptionLockScreen";
import DebtorModal from "@/debtors/DebtorModal";
import { PageLoadingState } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DashboardStats, RecentTransactions } from "@/dashboard/components";
import { AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";

export default function Dashboard() {
  useAuth();
  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();
  const { hasExpired, isLoading: subscriptionLoading } = useSubscription();

  const summary = data?.data?.summary;
  const recentActivities = data?.data?.recentActivities || [];
  const averageDebtPerDebtor = data?.data?.trends?.averageDebtPerDebtor || 0;

  const addDebtorAction = (
    <Button size="sm" onClick={() => setIsDebtorModalOpen(true)}>
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Add Debtor</span>
    </Button>
  );

  if (isLoading || subscriptionLoading) {
    return <PageLoadingState title="Dashboard" headerActions={addDebtorAction} />;
  }

  if (hasExpired) {
    return <SubscriptionLockScreen />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your debt portfolio
            </p>
          </div>
          {addDebtorAction}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Something went wrong
              </h3>
              <p className="text-sm text-muted-foreground">
                We couldn't load your dashboard. Please try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your debt portfolio
          </p>
        </div>
        {addDebtorAction}
      </div>

      {summary && (
        <DashboardStats
          summary={summary}
          averageDebtPerDebtor={averageDebtPerDebtor}
        />
      )}

      <RecentTransactions transactions={recentActivities} />

      <DebtorModal
        isOpen={isDebtorModalOpen}
        onClose={() => setIsDebtorModalOpen(false)}
      />
    </div>
  );
}
