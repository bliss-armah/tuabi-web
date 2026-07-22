import { Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface DebtorEmptyStateProps {
  searchTerm: string;
  onAddDebtor: () => void;
}

export default function DebtorEmptyState({
  searchTerm,
  onAddDebtor,
}: DebtorEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground md:text-xl">
          {searchTerm ? "No debtors found" : "No debtors yet"}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {searchTerm
            ? "Try adjusting your search terms to find what you're looking for."
            : "Get started by adding your first debtor to track their payments and manage their information."}
        </p>
        {!searchTerm && (
          <Button onClick={onAddDebtor} className="mt-2">
            Add Your First Debtor
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
