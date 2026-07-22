import { Phone, Eye, Pencil, Plus } from "lucide-react";
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
              <TableRow key={debtor.id}>
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
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      onClick={() => onViewDetails(debtor)}
                      variant="ghost"
                      size="icon-sm"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onEdit(debtor)}
                      variant="ghost"
                      size="icon-sm"
                      title="Edit Debtor"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => onAddPayment(debtor)} size="sm">
                      <Plus className="h-4 w-4" />
                      Payment
                    </Button>
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
