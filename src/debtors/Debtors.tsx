import { useGetDebtorsQuery } from "@/debtors/debtorApi";
import { useSubscription } from "@/shared/hooks/useSubscription";
import { useDebtorFilters } from "@/debtors/hooks/useDebtorFilters";
import SubscriptionLockScreen from "@/subscription/SubscriptionLockScreen";
import DebtorModal from "@/debtors/DebtorModal";
import PaymentModal from "@/debtors/PaymentModal";
import { DebtorCard, DebtorTable, DebtorEmptyState } from "@/debtors/components";
import type { Debtor } from "@/shared/types/debtor";
import { Plus, Search, List, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataFetchWrapper, PageLoadingState } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/utils";
import DebtorsPageSkeleton from "@/shared/components/skeletons/DebtorsPageSkeleton";
import { useAuth } from "@/shared/hooks/useAuth";
import sseService from "@/shared/services/sseService";
import { useEffect } from "react";

type ViewMode = "table" | "cards";

export default function Debtors() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useGetDebtorsQuery();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDebtor, setPaymentDebtor] = useState<Debtor | null>(null);
  const navigate = useNavigate();

  const { hasExpired, isLoading: subscriptionLoading } = useSubscription();

  const debtors = data?.data || [];
  const { searchTerm, setSearchTerm, filteredDebtors } =
    useDebtorFilters(debtors);

  useEffect(() => {
    if (user?.id) {
      sseService.connect(user.id);
      return () => {
        sseService.disconnect();
      };
    }
  }, [user?.id]);

  if (isLoading || subscriptionLoading) {
    return (
      <PageLoadingState
        title="Debtors"
        headerActions={
          <Button onClick={() => setIsDebtorModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Debtor</span>
          </Button>
        }
      >
        <DebtorsPageSkeleton />
      </PageLoadingState>
    );
  }

  if (hasExpired) {
    return <SubscriptionLockScreen />;
  }
  const handleAddDebtor = () => {
    setSelectedDebtor(null);
    setIsDebtorModalOpen(true);
  };

  const handleEditDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setIsDebtorModalOpen(true);
  };

  const handleViewDetails = (debtor: Debtor) => {
    navigate(`/debtors/${debtor.id}`);
  };

  const handleAddPayment = (debtor: Debtor) => {
    setPaymentDebtor(debtor);
    setIsPaymentModalOpen(true);
  };

  const closeDebtorModal = () => {
    setIsDebtorModalOpen(false);
    setSelectedDebtor(null);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentDebtor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Debtors</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage the people who owe you money.
          </p>
        </div>
        <Button onClick={handleAddDebtor}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Debtor</span>
        </Button>
      </div>

      <DataFetchWrapper
        isLoading={false}
        error={error}
        onRetry={refetch}
        errorTitle="Failed to load debtors"
        errorMessage="Unable to fetch your debtors. Please check your connection and try again."
        errorVariant="card"
      >
        {/* Search and View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search debtors by name"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggle - Only show on tablet and up */}
          <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted p-1 lg:flex">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Debtors List */}
        {filteredDebtors.length === 0 ? (
          <DebtorEmptyState
            searchTerm={searchTerm}
            onAddDebtor={handleAddDebtor}
          />
        ) : (
          <>
            {/* Desktop Views (md and up) */}
            <div className="hidden md:block">
              {viewMode === "table" ? (
                <DebtorTable
                  debtors={filteredDebtors}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditDebtor}
                  onAddPayment={handleAddPayment}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredDebtors.map((debtor: Debtor) => (
                    <DebtorCard
                      key={debtor.id}
                      debtor={debtor}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditDebtor}
                      onAddPayment={handleAddPayment}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Card View (always cards on mobile) */}
            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-4">
                {filteredDebtors.map((debtor: Debtor) => (
                  <DebtorCard
                    key={debtor.id}
                    debtor={debtor}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditDebtor}
                    onAddPayment={handleAddPayment}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </DataFetchWrapper>

      {/* Modals */}
      <DebtorModal
        isOpen={isDebtorModalOpen}
        onClose={closeDebtorModal}
        debtor={selectedDebtor}
      />

      {paymentDebtor && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          debtor={paymentDebtor}
        />
      )}
    </div>
  );
}
