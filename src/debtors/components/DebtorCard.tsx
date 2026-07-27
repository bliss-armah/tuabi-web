import { Phone, Calendar, Eye, Pencil, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
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
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onViewDetails(debtor)}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          onViewDetails(debtor);
        }
      }}
      className={cn(
        "cursor-pointer gap-0 py-0 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              {debtor.imageUrl && <AvatarImage src={debtor.imageUrl} alt={debtor.name} />}
              <AvatarFallback className="uppercase">
                {debtor.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
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
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-destructive">
                GH₵ {debtor.amountOwed?.toLocaleString() || 0}
              </p>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                Amount Owed
              </p>
            </div>
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Debtor actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onSelect={() => onViewDetails(debtor)}>
                    <Eye className="h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onEdit(debtor)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onAddPayment(debtor)}>
                    <Plus className="h-4 w-4" />
                    Make payment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
      </CardContent>
    </Card>
  );
}
