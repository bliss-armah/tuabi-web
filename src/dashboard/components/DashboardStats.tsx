import { Users, Wallet, TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/utils";
import type { DashboardSummary } from "@/shared/types/debtor";

interface DashboardStatsProps {
  summary: DashboardSummary;
  averageDebtPerDebtor: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
}

function StatCard({ title, value, icon, valueClassName }: StatCardProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <CardAction className="text-muted-foreground">{icon}</CardAction>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold tracking-tight", valueClassName)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats({
  summary,
  averageDebtPerDebtor,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => `GH₵ ${amount.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Debtors"
        value={summary?.totalDebtors || 0}
        icon={<Users className="h-5 w-5" />}
      />

      <StatCard
        title="Total Amount Owed"
        value={formatCurrency(summary?.totalAmountOwed || 0)}
        icon={<Wallet className="h-5 w-5" />}
        valueClassName="text-destructive"
      />

      <StatCard
        title="Average Debt per Debtor"
        value={formatCurrency(averageDebtPerDebtor || 0)}
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  );
}
