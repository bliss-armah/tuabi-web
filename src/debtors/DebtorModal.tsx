import { useState, useEffect } from "react";
import {
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
} from "@/debtors/debtorApi";
import { Loader2 } from "lucide-react";
import type { Debtor } from "@/shared/types/debtor";
import { showSuccessToast } from "@/shared/utils/toastConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface DebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor?: Debtor | null; // If provided, we're editing; if null, we're creating
}

export default function DebtorModal({
  isOpen,
  onClose,
  debtor,
}: DebtorModalProps) {
  const [createDebtor] = useCreateDebtorMutation();
  const [updateDebtor] = useUpdateDebtorMutation();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    amountOwed: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(debtor);
  const modalTitle = isEditing ? "Edit Debtor" : "Add New Debtor";
  const submitButtonText = isEditing ? "Update Debtor" : "Add Debtor";
  const loadingText = isEditing ? "Updating..." : "Adding...";

  useEffect(() => {
    if (isOpen) {
      if (debtor) {
        setFormData({
          name: debtor.name,
          phoneNumber: debtor.phoneNumber || "",
          amountOwed: debtor.amountOwed.toString(),
          description: debtor.description || "",
        });
      } else {
        setFormData({
          name: "",
          phoneNumber: "",
          amountOwed: "",
          description: "",
        });
      }
      setError(null);
    }
  }, [isOpen, debtor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const debtorData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        amountOwed: parseFloat(formData.amountOwed) || 0,
        description: formData.description,
      };

      if (isEditing && debtor) {
        await updateDebtor({
          id: debtor.id,
          data: debtorData,
        }).unwrap();
        showSuccessToast("Debtor updated successfully");
      } else {
        await createDebtor(debtorData).unwrap();
        showSuccessToast("Debtor added successfully");
      }

      setFormData({
        name: "",
        phoneNumber: "",
        amountOwed: "",
        description: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Debtor operation error:", error);
      setError(
        error?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} debtor`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="Enter debtor's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g 0241234567"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountOwed">Amount Owed (GH₵) *</Label>
            <Input
              id="amountOwed"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              value={formData.amountOwed}
              onChange={(e) =>
                setFormData({ ...formData, amountOwed: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              className="resize-none"
              placeholder="Add any notes about this debtor..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingText}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
