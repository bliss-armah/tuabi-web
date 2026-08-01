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
import { ArrowLeft, Phone, Bell, MapPin, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DebtorModal from "@/debtors/DebtorModal";
import PaymentModal from "@/debtors/PaymentModal";
import { DataFetchWrapper } from "@/shared/components";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/utils";
import { formatPhoneNumber } from "@/debtors/utils/debtorUtils";
import DebtorReminders from "@/reminders/DebtorReminders";
import { useAuth } from "@/shared/hooks/useAuth";
import { showSuccessToast, showErrorToast } from "@/shared/utils/toastConfig";

interface HistoryItem {
  id: number;
  action: string;
  amountChanged: number;
  note?: string | null;
  timestamp: string;
  images?: { id: number; url: string }[];
  user?: { name?: string };
}

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const isPayment = (action: string) =>
  action === "reduce" || action === "settled";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const formatBalance = (amount: number) => {
  const [int, dec] = Math.abs(amount).toFixed(2).split(".");
  return { int: Number(int).toLocaleString(), dec };
};

const daysBetween = (from: string) => {
  const diff = Date.now() - new Date(from).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
};

const isToday = (value: string) => {
  const d = new Date(value);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const eyebrow = "font-mono text-[11px] font-semibold uppercase tracking-[0.14em]";
const bordered =
  "rounded-[10px] border border-input text-foreground transition-colors duration-150 hover:bg-accent";

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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "reminders">(
    "transactions"
  );
  const [isExporting, setIsExporting] = useState(false);
  const { user, workspace } = useAuth();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    setActiveTab(tabParam === "reminders" ? "reminders" : "transactions");
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

  const entries = ([...(history?.data ?? [])] as unknown as HistoryItem[]).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let running = 0;
  const timeline = entries.map((entry, index) => {
    running += isPayment(entry.action) ? -entry.amountChanged : entry.amountChanged;
    const isFirstDebt = !isPayment(entry.action) && index === 0;
    return { ...entry, running, isFirstDebt };
  });

  const payments = entries.filter((e) => isPayment(e.action));
  const totalPaid = payments.reduce((sum, e) => sum + e.amountChanged, 0);
  const hasPayments = payments.length > 0;

  const balance = debtorData?.amountOwed ?? 0;
  const settled = balance <= 0;
  const { int: balInt, dec: balDec } = formatBalance(balance);

  const lastEntry = entries[entries.length - 1];
  const lastActivityAt = lastEntry?.timestamp ?? debtorData?.createdAt ?? "";
  const lastActivityLabel = (() => {
    if (!lastEntry) return "debt created";
    if (isPayment(lastEntry.action)) return "payment received";
    return timeline.length === 1 ? "debt created" : "debt updated";
  })();

  const photos =
    debtorData?.images && debtorData.images.length > 0
      ? debtorData.images
      : debtorData?.imageUrl
        ? [{ id: -1, url: debtorData.imageUrl }]
        : [];
  const hasPhoto = photos.length > 0;
  const initials = debtorData ? initialsOf(debtorData.name) : "?";
  const daysUnchanged = lastActivityAt ? daysBetween(lastActivityAt) : 0;

  const handleExportPdf = async () => {
    if (!debtorData) return;
    setIsExporting(true);
    try {
      const { exportDebtorHistoryPdf } = await import(
        "@/debtors/utils/exportDebtorHistoryPdf"
      );
      await exportDebtorHistoryPdf({
        debtor: {
          name: debtorData.name,
          phoneNumber: debtorData.phoneNumber,
          location: debtorData.location,
          description: debtorData.description,
          amountOwed: debtorData.amountOwed,
          createdAt: debtorData.createdAt,
        },
        entries,
        workspaceName: workspace?.name,
        generatedBy: user?.name,
      });
      showSuccessToast("Statement downloaded");
    } catch (err) {
      console.error("PDF export failed:", err);
      showErrorToast("Could not generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DataFetchWrapper
      isLoading={isLoading || historyLoading}
      error={null}
      loadingMessage="Loading debtor details..."
      loadingVariant="page"
    >
      {debtorData && (
        <div className="font-display rounded-[16px] border border-border bg-background p-5 text-foreground sm:px-9 sm:pt-8 sm:pb-9">
          <div className="flex flex-col gap-[26px]">
            {/* 1. Header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/debtors")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-input text-muted-foreground transition-colors duration-150 hover:bg-accent"
                  aria-label="Back to debtors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex min-w-0 flex-col gap-[5px]">
                  <h1 className="truncate text-[26px] font-extrabold leading-none tracking-[-0.02em]">
                    {debtorData.name}
                  </h1>
                  <div className="text-[13px] font-medium text-muted-foreground">
                    {debtorData.phoneNumber
                      ? `${formatPhoneNumber(debtorData.phoneNumber)} · `
                      : ""}
                    customer since {formatDate(debtorData.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-[10px]">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className={cn(
                    bordered,
                    "flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-[18px] py-[11px] text-center text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  )}
                  aria-label="Export statement as PDF"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? "Preparing..." : "Export PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDebtorModalOpen(true)}
                  className={cn(
                    bordered,
                    "flex-1 whitespace-nowrap px-[18px] py-[11px] text-center text-[14px] font-semibold sm:flex-none"
                  )}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 whitespace-nowrap rounded-[10px] bg-primary px-[18px] py-[11px] text-center text-[14px] font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-150 hover:bg-primary/90 sm:flex-none"
                >
                  + Record payment
                </button>
              </div>
            </div>

            {/* 2. Stat row */}
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-[1.35fr_1fr_1fr]">
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-[16px] border px-[26px] py-6",
                  settled
                    ? "border-success/20 bg-success/5"
                    : "border-destructive/20 bg-destructive/5"
                )}
              >
                <div
                  className={cn(
                    eyebrow,
                    settled ? "text-success/80" : "text-destructive/80"
                  )}
                >
                  {settled ? "SETTLED" : "BALANCE OWED"}
                </div>
                <div
                  className={cn(
                    "whitespace-nowrap text-[38px] font-extrabold leading-none tracking-[-0.03em] sm:text-[46px]",
                    settled ? "text-success" : "text-destructive"
                  )}
                >
                  GH₵ {settled ? "0" : balInt}
                  {!settled && (
                    <span className="text-[24px] text-destructive/60">
                      .{balDec}
                    </span>
                  )}
                </div>
                {(settled || daysUnchanged >= 1) && (
                  <div className="text-[13px] font-medium text-muted-foreground">
                    {settled
                      ? "Fully paid"
                      : `Unchanged for ${daysUnchanged} ${daysUnchanged === 1 ? "day" : "days"}`}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-card px-[26px] py-6">
                <div className={cn(eyebrow, "text-muted-foreground")}>
                  TOTAL PAID
                </div>
                <div className="text-[34px] font-extrabold leading-none tracking-[-0.02em]">
                  GH₵ {totalPaid.toLocaleString()}
                </div>
                {payments.length > 0 && (
                  <div className="text-[13px] font-medium text-muted-foreground">
                    across {payments.length}{" "}
                    {payments.length === 1 ? "payment" : "payments"}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-card px-[26px] py-6">
                <div className={cn(eyebrow, "text-muted-foreground")}>
                  LAST ACTIVITY
                </div>
                <div className="text-[34px] font-extrabold leading-none tracking-[-0.02em]">
                  {lastActivityAt && isToday(lastActivityAt)
                    ? "Today"
                    : lastActivityAt
                      ? formatDate(lastActivityAt)
                      : "—"}
                </div>
                <div className="text-[13px] font-medium text-muted-foreground">
                  {lastActivityLabel}
                </div>
              </div>
            </div>

            {/* 3. Body */}
            <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1fr_320px]">
              {/* Left — tabs + content */}
              <div className="flex flex-col gap-[18px]">
                <div className="flex items-center gap-[26px] border-b border-border">
                  {(["transactions", "reminders"] as const).map((tab) => {
                    const active = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "-mb-px border-b-2 pb-3 text-[15px]",
                          active
                            ? "border-primary font-bold text-foreground"
                            : "border-transparent font-semibold text-muted-foreground"
                        )}
                      >
                        {tab === "transactions"
                          ? "Transaction history"
                          : "Reminders"}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "transactions" && (
                  <div className="flex max-h-[480px] flex-col overflow-y-auto pr-1">
                    {timeline.map((entry, index) => {
                      const showConnector =
                        index < timeline.length - 1 || !hasPayments;
                      const payment = isPayment(entry.action);
                      const title = entry.isFirstDebt
                        ? `Debt created — GH₵ ${entry.amountChanged.toLocaleString()}`
                        : payment
                          ? `Payment — GH₵ ${entry.amountChanged.toLocaleString()}`
                          : `Debt added — GH₵ ${entry.amountChanged.toLocaleString()}`;
                      const meta = [
                        formatDate(entry.timestamp),
                        entry.note ? `“${entry.note}”` : null,
                        entry.user?.name ? `recorded by ${entry.user.name}` : null,
                        payment
                          ? `balance GH₵ ${Math.max(0, entry.running).toLocaleString()}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <div key={entry.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="mt-1.5 h-[11px] w-[11px] rounded-full bg-primary" />
                            {showConnector && (
                              <span className="w-0.5 flex-1 bg-border" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 pb-[26px]">
                            <div className="text-[15px] font-bold leading-[1.3]">
                              {title}
                            </div>
                            <div className="text-[13px] font-medium leading-[1.5] text-muted-foreground">
                              {meta}
                            </div>
                            {entry.images && entry.images.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {entry.images.map((img) => (
                                  <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setLightboxUrl(img.url)}
                                    className="rounded-md border border-border"
                                  >
                                    <img
                                      src={img.url}
                                      alt="Purchase"
                                      className="h-12 w-12 rounded-md object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {!hasPayments && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="mt-1.5 h-[11px] w-[11px] rounded-full border border-input bg-muted" />
                        </div>
                        <div className="flex flex-col gap-[10px]">
                          <div className="text-[15px] font-semibold leading-[1.3] text-muted-foreground">
                            Awaiting first payment
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="self-start rounded-[9px] border border-primary/30 bg-primary/10 px-[18px] py-[10px] text-[13px] font-bold text-primary transition-colors duration-150 hover:bg-primary/15"
                          >
                            Record payment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reminders" && (
                  <DebtorReminders
                    debtorId={debtorId}
                    debtorName={debtorData.name}
                    debtorAmountOwed={debtorData.amountOwed}
                  />
                )}
              </div>

              {/* Right rail */}
              <div className="flex flex-col gap-[14px]">
                {hasPhoto ? (
                  <div className="rounded-[16px] border border-border bg-card">
                    <div className="flex items-center justify-between px-5 pt-[18px]">
                      <div
                        className={cn(
                          eyebrow,
                          "tracking-[0.12em] text-muted-foreground"
                        )}
                      >
                        Photos
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {photos.length}/5
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-[18px] pt-3">
                      {photos.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setLightboxUrl(img.url)}
                          className="overflow-hidden rounded-md border border-border"
                        >
                          <img
                            src={img.url}
                            alt="Purchase"
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDebtorModalOpen(true)}
                    className="flex items-center gap-[14px] rounded-[16px] border border-dashed border-input bg-card px-5 py-[18px] text-left"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-primary/20 bg-primary/10 text-[15px] font-bold text-primary">
                      {initials}
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div className="text-[13px] font-bold">
                        No photo on file
                      </div>
                      <div className="text-[12px] font-semibold text-primary">
                        Add one
                      </div>
                    </div>
                  </button>
                )}

                {debtorData.location && (
                  <div className="flex flex-col gap-[7px] rounded-[16px] border border-border bg-card px-5 py-[18px]">
                    <div
                      className={cn(
                        eyebrow,
                        "tracking-[0.12em] text-muted-foreground"
                      )}
                    >
                      LOCATION
                    </div>
                    <div className="flex items-start gap-2 text-[15px] font-semibold leading-[1.5]">
                      <MapPin className="mt-[3px] h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{debtorData.location}</span>
                    </div>
                  </div>
                )}

                {debtorData.description && (
                  <div className="flex flex-col gap-[7px] rounded-[16px] border border-border bg-card px-5 py-[18px]">
                    <div
                      className={cn(
                        eyebrow,
                        "tracking-[0.12em] text-muted-foreground"
                      )}
                    >
                      DESCRIPTION
                    </div>
                    <div className="text-[15px] font-semibold leading-[1.5]">
                      {debtorData.description}
                    </div>
                  </div>
                )}

                <div className="flex gap-[10px]">
                  {debtorData.phoneNumber ? (
                    <a
                      href={`tel:${debtorData.phoneNumber}`}
                      className={cn(
                        bordered,
                        "flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-semibold"
                      )}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  ) : (
                    <span className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-input py-3 text-[13px] font-semibold text-foreground opacity-40">
                      <Phone className="h-4 w-4" />
                      Call
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab("reminders")}
                    className={cn(
                      bordered,
                      "flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-semibold"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Remind
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
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

          <Dialog
            open={!!lightboxUrl}
            onOpenChange={(open) => !open && setLightboxUrl(null)}
          >
            <DialogContent className="max-w-2xl">
              {lightboxUrl && (
                <img
                  src={lightboxUrl}
                  alt="Debtor"
                  className="max-h-[80vh] w-full rounded-md object-contain"
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DataFetchWrapper>
  );
}
