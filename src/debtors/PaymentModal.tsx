import { useState } from "react";
import {
  useIncrementDebtorAmountMutation,
  useDecrementDebtorAmountMutation,
} from "@/debtors/debtorApi";
import { TrendingUp, TrendingDown, Check, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/utils/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: {
    id: number;
    name: string;
    amountOwed: number;
  };
}

export default function PaymentModal({
  isOpen,
  onClose,
  debtor,
}: PaymentModalProps) {
  const [incrementDebtorAmount] = useIncrementDebtorAmountMutation();
  const [decrementDebtorAmount] = useDecrementDebtorAmountMutation();
  const [formData, setFormData] = useState({
    action: "reduce" as "add" | "reduce" | "settled",
    amount: "",
    note: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For settled action, use the current debt amount to clear it completely
      const amount =
        formData.action === "settled"
          ? debtor.amountOwed
          : parseFloat(formData.amount) || 0;

      const note =
        formData.note ||
        (formData.action === "settled" ? "Debt settled in full" : "");

      const mutationData = {
        id: debtor.id,
        data: { amount, note },
      };

      // Use the appropriate mutation based on action
      if (formData.action === "add") {
        await incrementDebtorAmount(mutationData).unwrap();
      } else {
        // Both "reduce" and "settled" use decrement
        await decrementDebtorAmount(mutationData).unwrap();
      }

      // Reset form and close modal
      setFormData({
        action: "reduce",
        amount: "",
        note: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error?.data?.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  const actionOptions = [
    {
      value: "reduce" as const,
      label: "Reduce debt",
      description: "Customer made a payment — lower the amount they owe.",
      icon: TrendingDown,
      iconClass: "text-success",
    },
    {
      value: "add" as const,
      label: "Add to debt",
      description: "Customer took more credit — increase the amount they owe.",
      icon: TrendingUp,
      iconClass: "text-destructive",
    },
    {
      value: "settled" as const,
      label: "Settle in full",
      description: "Clear the entire balance and mark the debt as fully paid.",
      icon: Check,
      iconClass: "text-success",
    },
  ];

  const selectedOption = actionOptions.find(
    (o) => o.value === formData.action
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted p-4">
          <h3 className="font-semibold text-foreground">{debtor.name}</h3>
          <p className="text-sm text-muted-foreground">
            Current Amount Owed:{" "}
            <span className="font-semibold text-destructive">
              GH₵ {debtor.amountOwed.toLocaleString()}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment-action">What do you want to do?</Label>
            <Select
              value={formData.action}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  action: value as "add" | "reduce" | "settled",
                })
              }
            >
              <SelectTrigger id="payment-action" className="h-auto w-full py-2">
                <SelectValue>
                  {selectedOption && (
                    <span className="flex items-center gap-2">
                      <selectedOption.icon
                        className={cn("h-4 w-4 shrink-0", selectedOption.iconClass)}
                      />
                      <span className="font-medium">{selectedOption.label}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="items-start py-2.5"
                  >
                    <span className="flex items-start gap-2.5">
                      <option.icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          option.iconClass
                        )}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium leading-none">
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Only show amount input for add/reduce actions */}
          {formData.action !== "settled" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (GH₵) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          )}

          {/* Show settled info when settled is selected */}
          {formData.action === "settled" && (
            <div className="rounded-xl border border-success/30 bg-success/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm font-medium text-success">
                  Debt Settlement
                </span>
              </div>
              <p className="text-sm text-success">
                This will clear the entire debt of{" "}
                <strong>GH₵ {debtor.amountOwed.toLocaleString()}</strong> and
                mark it as fully settled.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              rows={3}
              className="resize-none"
              placeholder={
                formData.action === "settled"
                  ? "Add a note about the settlement..."
                  : "Add a note about this payment..."
              }
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
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
            <Button
              type="submit"
              variant={formData.action === "add" ? "destructive" : "default"}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : formData.action === "settled" ? (
                "Mark as Settled"
              ) : (
                "Update Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
