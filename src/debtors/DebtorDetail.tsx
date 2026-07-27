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
import { ArrowLeft, Phone, Bell } from "lucide-react";
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

interface HistoryItem {
  id: number;
  action: string;
  amountChanged: number;
  note?: string | null;
  timestamp: string;
  images?: { id: number; url: string }[];
  user?: { name?: string };
}

const C = {
  page: "#0b0e14",
  card: "#0f131b",
  border: "#1c2330",
  borderStrong: "#232b3a",
  text: "#f2f4f8",
  body: "#e6e9ef",
  secondary: "#c3c9d6",
  muted: "#8b94a6",
  faint: "#6b7488",
  eyebrow: "#616a7d",
  primary: "#6366f1",
  primaryLight: "#a5abff",
  link: "#8b93ff",
  danger: "#f87171",
  success: "#34d399",
};

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

  const hasPhoto = Boolean(debtorData?.imageUrl);
  const initials = debtorData ? initialsOf(debtorData.name) : "?";
  const daysUnchanged = lastActivityAt ? daysBetween(lastActivityAt) : 0;

  const openPhotoFlow = () => {
    if (hasPhoto && debtorData?.imageUrl) {
      setLightboxUrl(debtorData.imageUrl);
    } else {
      setIsDebtorModalOpen(true);
    }
  };

  const bordered =
    "rounded-[10px] border border-[#232b3a] text-[#c3c9d6] transition-colors duration-150 hover:border-[#313a4b]";

  return (
    <DataFetchWrapper
      isLoading={isLoading || historyLoading}
      error={null}
      loadingMessage="Loading debtor details..."
      loadingVariant="page"
    >
      {debtorData && (
        <div
          className="font-display rounded-[16px] border border-[#1c2330] bg-[#0b0e14] p-5 sm:px-9 sm:pt-8 sm:pb-9"
          style={{ color: C.body }}
        >
          <div className="flex flex-col gap-[26px]">
            {/* 1. Header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/debtors")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[#232b3a] text-[#8b94a6] transition-colors duration-150 hover:border-[#313a4b]"
                  aria-label="Back to debtors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex min-w-0 flex-col gap-[5px]">
                  <h1
                    className="truncate text-[26px] font-extrabold leading-none"
                    style={{ color: C.text, letterSpacing: "-0.02em" }}
                  >
                    {debtorData.name}
                  </h1>
                  <div className="text-[13px] font-medium" style={{ color: C.faint }}>
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
                  className="flex-1 whitespace-nowrap rounded-[10px] px-[18px] py-[11px] text-center text-[14px] font-bold text-white transition-colors duration-150 sm:flex-none"
                  style={{
                    background: C.primary,
                    boxShadow: "0 6px 20px -6px #6366f1aa",
                  }}
                >
                  + Record payment
                </button>
              </div>
            </div>

            {/* 2. Stat row */}
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-[1.35fr_1fr_1fr]">
              <div
                className="flex flex-col gap-3 rounded-[16px] px-[26px] py-6"
                style={{
                  background: "linear-gradient(140deg,#1a1319 0%,#10131b 70%)",
                  border: `1px solid ${settled ? "#34d39929" : "#f8717129"}`,
                }}
              >
                <div
                  className="font-mono text-[11px] font-semibold uppercase"
                  style={{
                    letterSpacing: "0.14em",
                    color: settled ? "#6ea98f" : "#a1707a",
                  }}
                >
                  {settled ? "SETTLED" : "BALANCE OWED"}
                </div>
                <div
                  className="whitespace-nowrap text-[38px] font-extrabold leading-none sm:text-[46px]"
                  style={{
                    color: settled ? C.success : C.danger,
                    letterSpacing: "-0.03em",
                  }}
                >
                  GH₵ {settled ? "0" : balInt}
                  {!settled && (
                    <span style={{ fontSize: "24px", color: "#f8717199" }}>
                      .{balDec}
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-medium" style={{ color: C.muted }}>
                  {settled
                    ? "Fully paid"
                    : `Unchanged for ${daysUnchanged} ${daysUnchanged === 1 ? "day" : "days"}`}
                </div>
              </div>

              <div
                className="flex flex-col gap-3 rounded-[16px] px-[26px] py-6"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  className="font-mono text-[11px] font-semibold uppercase"
                  style={{ letterSpacing: "0.14em", color: C.eyebrow }}
                >
                  TOTAL PAID
                </div>
                <div
                  className="text-[34px] font-extrabold leading-none"
                  style={{ color: C.body, letterSpacing: "-0.02em" }}
                >
                  GH₵ {totalPaid.toLocaleString()}
                </div>
                <div className="text-[13px] font-medium" style={{ color: C.faint }}>
                  across {payments.length}{" "}
                  {payments.length === 1 ? "payment" : "payments"}
                </div>
              </div>

              <div
                className="flex flex-col gap-3 rounded-[16px] px-[26px] py-6"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  className="font-mono text-[11px] font-semibold uppercase"
                  style={{ letterSpacing: "0.14em", color: C.eyebrow }}
                >
                  LAST ACTIVITY
                </div>
                <div
                  className="text-[34px] font-extrabold leading-none"
                  style={{ color: C.body, letterSpacing: "-0.02em" }}
                >
                  {lastActivityAt && isToday(lastActivityAt)
                    ? "Today"
                    : lastActivityAt
                      ? formatDate(lastActivityAt)
                      : "—"}
                </div>
                <div className="text-[13px] font-medium" style={{ color: C.faint }}>
                  {lastActivityLabel}
                </div>
              </div>
            </div>

            {/* 3. Body */}
            <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1fr_320px]">
              {/* Left — tabs + content */}
              <div className="flex flex-col gap-[18px]">
                <div
                  className="flex items-center gap-[26px]"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  {(["transactions", "reminders"] as const).map((tab) => {
                    const active = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className="pb-3 text-[15px]"
                        style={{
                          fontWeight: active ? 700 : 600,
                          color: active ? C.text : C.faint,
                          boxShadow: active
                            ? `inset 0 -2px 0 ${C.primary}`
                            : "none",
                        }}
                      >
                        {tab === "transactions"
                          ? "Transaction history"
                          : "Reminders"}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "transactions" && (
                  <div className="flex flex-col">
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
                            <span
                              className="mt-1.5 h-[11px] w-[11px] rounded-full"
                              style={{ background: C.primary }}
                            />
                            {showConnector && (
                              <span
                                className="w-0.5 flex-1"
                                style={{ background: C.border }}
                              />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 pb-[26px]">
                            <div
                              className="text-[15px] font-bold leading-[1.3]"
                              style={{ color: C.body }}
                            >
                              {title}
                            </div>
                            <div
                              className="text-[13px] font-medium leading-[1.5]"
                              style={{ color: C.faint }}
                            >
                              {meta}
                            </div>
                            {entry.images && entry.images.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {entry.images.map((img) => (
                                  <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setLightboxUrl(img.url)}
                                    className="rounded-md border border-[#1c2330]"
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
                          <span
                            className="mt-1.5 h-[11px] w-[11px] rounded-full border"
                            style={{
                              borderColor: "#3a4356",
                              background: "#161c27",
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-[10px]">
                          <div
                            className="text-[15px] font-semibold leading-[1.3]"
                            style={{ color: C.faint }}
                          >
                            Awaiting first payment
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="self-start rounded-[9px] px-[18px] py-[10px] text-[13px] font-bold transition-colors duration-150"
                            style={{
                              background: "#6366f11f",
                              border: "1px solid #6366f14d",
                              color: C.primaryLight,
                            }}
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
                  />
                )}
              </div>

              {/* Right rail */}
              <div className="flex flex-col gap-[14px]">
                {hasPhoto ? (
                  <button
                    type="button"
                    onClick={openPhotoFlow}
                    className="overflow-hidden rounded-[16px] text-left"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <img
                      src={debtorData.imageUrl ?? ""}
                      alt="Photo captured at signup"
                      className="block h-[190px] w-full object-cover"
                    />
                    <div
                      className="flex flex-col gap-1 px-4 py-[14px]"
                      style={{ borderTop: `1px solid ${C.border}` }}
                    >
                      <div
                        className="text-[13px] font-bold"
                        style={{ color: C.secondary }}
                      >
                        Captured at signup
                      </div>
                      <div
                        className="font-mono text-[12px] font-medium"
                        style={{ color: C.eyebrow }}
                      >
                        {formatDate(debtorData.createdAt)} ·{" "}
                        {new Date(debtorData.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDebtorModalOpen(true)}
                    className="flex items-center gap-[14px] rounded-[16px] px-5 py-[18px] text-left"
                    style={{
                      background: C.card,
                      border: "1px dashed #232b3a",
                    }}
                  >
                    <div
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-[15px] font-bold"
                      style={{
                        background: "#6366f11a",
                        border: "1px solid #6366f133",
                        color: C.primaryLight,
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div
                        className="text-[13px] font-bold"
                        style={{ color: C.secondary }}
                      >
                        No photo on file
                      </div>
                      <div
                        className="text-[12px] font-semibold"
                        style={{ color: C.link }}
                      >
                        Add one
                      </div>
                    </div>
                  </button>
                )}

                {debtorData.description && (
                  <div
                    className="flex flex-col gap-[7px] rounded-[16px] px-5 py-[18px]"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <div
                      className="font-mono text-[11px] font-semibold uppercase"
                      style={{ letterSpacing: "0.12em", color: C.eyebrow }}
                    >
                      DESCRIPTION
                    </div>
                    <div
                      className="text-[15px] font-semibold leading-[1.5]"
                      style={{ color: C.body }}
                    >
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
                    <span
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#232b3a] py-3 text-[13px] font-semibold opacity-40"
                      )}
                      style={{ color: C.secondary }}
                    >
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
