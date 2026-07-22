import { Phone, Calendar, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/utils";
import type { Debtor } from "@/shared/types/debtor";

interface DebtorCardProps {
  debtor: Debtor;
  onViewDetails: (debtor: Debtor) => void;
  onEdit: (debtor: Debtor) => void;
  onAddPayment: (debtor: Debtor) => void;
  className?: string;
}

export default function DebtorCard({
  debtor,
  onViewDetails,
  onEdit,
  onAddPayment,
  className = "",
}: DebtorCardProps) {
  return (
    <Card className={cn("gap-0 py-0 transition-shadow hover:shadow-md", className)}>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold capitalize text-foreground">
              {debtor.name}
            </h3>
            {debtor.phoneNumber && (
              <div className="mt-1 flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm text-muted-foreground">
                  {debtor.phoneNumber}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4 text-right">
            <p className="text-2xl font-bold text-destructive">
              GH₵ {debtor.amountOwed?.toLocaleString() || 0}
            </p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              Amount Owed
            </p>
          </div>
        </div>

        {debtor.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {debtor.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">
            Added {new Date(debtor.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-end gap-2 md:justify-start">
          <Button
            onClick={() => onViewDetails(debtor)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Details</span>
          </Button>
          <Button onClick={() => onEdit(debtor)} variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
            <span className="hidden md:inline">Edit</span>
          </Button>
          <Button onClick={() => onAddPayment(debtor)} size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Payment</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
