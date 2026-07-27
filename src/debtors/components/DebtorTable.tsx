import { Phone, Eye, Pencil, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import type { Debtor } from "@/shared/types/debtor";

interface DebtorTableProps {
  debtors: Debtor[];
  onViewDetails: (debtor: Debtor) => void;
  onEdit: (debtor: Debtor) => void;
  onAddPayment: (debtor: Debtor) => void;
}

export default function DebtorTable({
  debtors,
  onViewDetails,
  onEdit,
  onAddPayment,
}: DebtorTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Debtor Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Amount Owed</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.map((debtor) => (
              <TableRow
                key={debtor.id}
                onClick={() => onViewDetails(debtor)}
                className="cursor-pointer"
              >
                <TableCell>
                  <span className="font-medium capitalize text-foreground">
                    {debtor.name}
                  </span>
                </TableCell>
                <TableCell>
                  {debtor.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {debtor.phoneNumber}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-lg font-bold text-destructive">
                    GH₵ {debtor.amountOwed?.toLocaleString() || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="max-w-48 truncate text-sm text-muted-foreground">
                    {debtor.description || "No description"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
