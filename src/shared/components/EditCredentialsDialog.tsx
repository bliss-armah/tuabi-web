import { useEffect, useState } from "react";
import { IdCard, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

export interface CredentialValues {
  name: string;
  email: string;
  phoneNumber: string;
}

interface EditCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel: string;
  current: CredentialValues;
  isLoading?: boolean;
  /** Receives only the changed fields. Return true on success to close. */
  onSubmit: (
    changes: Partial<CredentialValues>,
  ) => Promise<boolean> | boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditCredentialsDialog({
  open,
  onOpenChange,
  targetLabel,
  current,
  isLoading = false,
  onSubmit,
}: EditCredentialsDialogProps) {
  const [values, setValues] = useState<CredentialValues>(current);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(current);
      setError(null);
    }
  }, [open, current.name, current.email, current.phoneNumber]);

  const changes = (): Partial<CredentialValues> => {
    const diff: Partial<CredentialValues> = {};
    if (values.name.trim() !== current.name) diff.name = values.name.trim();
    if (values.email.trim().toLowerCase() !== current.email.toLowerCase())
      diff.email = values.email.trim();
    if (values.phoneNumber.trim() !== current.phoneNumber)
      diff.phoneNumber = values.phoneNumber.trim();
    return diff;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const diff = changes();
    if (Object.keys(diff).length === 0) {
      setError("Nothing has changed");
      return;
    }
    if (diff.name !== undefined && diff.name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (diff.email !== undefined && !EMAIL_PATTERN.test(diff.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (diff.phoneNumber !== undefined && !/^\d{9,15}$/.test(diff.phoneNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number");
      return;
    }

    const ok = await onSubmit(diff);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            Edit sign-in details
          </DialogTitle>
          <DialogDescription>
            Updating {targetLabel}. Email and phone number are used to sign in,
            so changes take effect on their next login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="cred-name">Full name</Label>
            <Input
              id="cred-name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cred-email">Email</Label>
            <Input
              id="cred-email"
              type="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cred-phone">Phone number</Label>
            <Input
              id="cred-phone"
              type="tel"
              inputMode="tel"
              value={values.phoneNumber}
              onChange={(e) =>
                setValues({ ...values, phoneNumber: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
