import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  useGetDebtorQuery,
  useGetDebtorHistoryQuery,
} from "@/debtors/debtorApi";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Banknote,
  TrendingUp,
  TrendingDown,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import DebtorModal from "@/debtors/DebtorModal";
import PaymentModal from "@/debtors/PaymentModal";
import { DebtorInfoCard, TabNavigation } from "@/debtors/components";
import { DataTable, DataFetchWrapper } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/utils";
import DebtorReminders from "@/reminders/DebtorReminders";

export default function DebtorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const debtorId = parseInt(id || "0");

  const { data: debtor, isLoading, error } = useGetDebtorQuery(debtorId);
  const { data: history, isLoading: historyLoading } =
    useGetDebtorHistoryQuery({ debtorId });

  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "reminders">(
    "transactions"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "reminders") {
      setActiveTab("reminders");
    } else {
      setActiveTab("transactions");
    }
  }, [location.search, searchParams]);

  if (error || (!isLoading && !debtor)) {
    return (
      <DataFetchWrapper
        isLoading={false}
        error={error || "Debtor not found"}
        onRetry={() => navigate("/debtors")}
        errorTitle="Debtor not found"
        errorMessage="The requested debtor could not be found. Please check the URL or return to the debtors list."
        errorVariant="page"
      >
        <></>
      </DataFetchWrapper>
    );
  }

  const debtorData = debtor?.data;

  const transactionColumns = [
    {
      key: "action",
      label: "Action",
      align: "center" as const,
      render: (value: string) => (
        <Badge
          variant={
            value === "add"
              ? "destructive"
              : value === "reduce"
                ? "outline"
                : "secondary"
          }
          className={cn(
            value === "reduce" && "border-success/40 bg-success/10 text-success"
          )}
        >
          {value === "add" && <TrendingUp className="h-3 w-3" />}
          {value === "reduce" && <TrendingDown className="h-3 w-3" />}
          {value === "settled" && <Check className="h-3 w-3" />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "amountChanged",
      label: "Amount",
      align: "right" as const,
      render: (value: number, row: any) => (
        <span
          className={cn(
            "font-semibold",
            row.action === "add" ? "text-destructive" : "text-success"
          )}
        >
          {row.action === "add" ? "+" : "-"} GH₵ {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: "note",
      label: "Note",
      render: (value: string) => (
        <p className="text-sm text-muted-foreground">{value || "No note"}</p>
      ),
    },
    {
      key: "timestamp",
      label: "Date & Time",
      align: "right" as const,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-xs">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
  ];

  return (
    <DataFetchWrapper
      isLoading={isLoading || historyLoading}
      error={null}
      loadingMessage="Loading debtor details..."
      loadingVariant="page"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              onClick={() => navigate("/debtors")}
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Back to debtors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {debtorData?.name}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={() => setIsDebtorModalOpen(true)} variant="outline">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button onClick={() => setIsPaymentModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </Button>
          </div>
        </div>

        {/* Debtor Info Card */}
        {debtorData && <DebtorInfoCard debtor={debtorData} />}

        {/* Tabs */}
        <div className="space-y-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                  Transaction History
                </h2>
                <div className="text-sm text-muted-foreground">
                  {history?.data.length || 0} transactions
                </div>
              </div>

              <DataTable
                columns={transactionColumns}
                data={history?.data || []}
                emptyMessage="No transactions yet"
                emptyIcon={
                  <Banknote className="h-10 w-10 text-muted-foreground" />
                }
              />
            </div>
          )}

          {activeTab === "reminders" && debtorData && (
            <DebtorReminders debtorId={debtorId} debtorName={debtorData.name} />
          )}
        </div>

        {/* Modals */}
        {debtorData && (
          <>
            <DebtorModal
              isOpen={isDebtorModalOpen}
              onClose={() => setIsDebtorModalOpen(false)}
              debtor={debtorData}
            />

            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              debtor={debtorData}
            />
          </>
        )}
      </div>
    </DataFetchWrapper>
  );
}
