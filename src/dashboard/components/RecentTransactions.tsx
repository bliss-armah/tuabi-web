import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import type { RecentTransactionsActivity } from "@/shared/types/debtor";

interface RecentTransactionsProps {
  transactions: RecentTransactionsActivity[];
  isLoading?: boolean;
}

export default function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  const isAdd = (action: string) => action.toLowerCase() === "add";

  const getAmountColor = (action: string) =>
    isAdd(action) ? "text-destructive" : "text-success";

  const getBadgeVariant = (
    action: string
  ): "destructive" | "secondary" | "outline" => {
    switch (action.toLowerCase()) {
      case "add":
        return "destructive";
      case "reduce":
      case "payment":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "add":
        return <TrendingUp className="h-3 w-3" />;
      case "reduce":
      case "payment":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case "add":
        return "Debt Added";
      case "reduce":
      case "payment":
        return "Payment Received";
      default:
        return action;
    }
  };

  const header = (
    <CardHeader className="border-b">
      <CardTitle className="text-base font-semibold">
        Recent Transactions
      </CardTitle>
      <CardAction>
        <Link
          to="/debtors"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardAction>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <Card className="gap-0 py-0">
        {header}
        <CardContent className="space-y-3 py-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasTransactions = transactions && transactions.length > 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {header}

      {hasTransactions ? (
        <div className="max-h-[calc(100vh-22rem)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Debtor Name</TableHead>
                <TableHead className="whitespace-nowrap text-center">
                  Action
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  Amount
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  Date &amp; Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className="font-medium capitalize">
                      {row.debtorName}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={getBadgeVariant(row.action)}
                      className="mx-auto"
                    >
                      {getActionIcon(row.action)}
                      {getActionLabel(row.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        getAmountColor(row.action)
                      )}
                    >
                      {isAdd(row.action) ? "+" : "-"} GH₵{" "}
                      {row.amountChanged.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {(() => {
                      const timestamp = (row as unknown as { timestamp: string })
                        .timestamp;
                      return (
                        <>
                          <div>{new Date(timestamp).toLocaleDateString()}</div>
                          <div className="text-xs">
                            {new Date(timestamp).toLocaleTimeString()}
                          </div>
                        </>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-base font-medium text-muted-foreground">
            No Recent Transactions
          </h3>
        </CardContent>
      )}
    </Card>
  );
}
