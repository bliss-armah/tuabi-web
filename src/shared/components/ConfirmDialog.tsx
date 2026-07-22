import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { buttonVariants } from "@/shared/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const accent = {
    danger: {
      icon: "text-destructive",
      iconBg: "bg-destructive/10",
      Icon: AlertTriangle,
      action: buttonVariants({ variant: "destructive" }),
    },
    warning: {
      icon: "text-warning",
      iconBg: "bg-warning/10",
      Icon: AlertTriangle,
      action: cn(buttonVariants({ variant: "default" }), "bg-warning text-warning-foreground hover:bg-warning/90"),
    },
    info: {
      icon: "text-primary",
      iconBg: "bg-primary/10",
      Icon: Info,
      action: buttonVariants({ variant: "default" }),
    },
  }[type];

  const Icon = accent.Icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                accent.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", accent.icon)} />
            </div>
            <div className="space-y-1 text-left">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={accent.action}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience hook for deletion confirmations
export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [deleteItem, setDeleteItem] = React.useState<{
    id: number | string;
    name: string;
    type: string;
  } | null>(null);
  const [onConfirm, setOnConfirm] = React.useState<(() => void) | null>(null);

  const showDeleteConfirmation = (
    id: number | string,
    name: string,
    type: string,
    confirmCallback: () => void
  ) => {
    setDeleteItem({ id, name, type });
    setOnConfirm(() => confirmCallback);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      setIsOpen(false);
      setDeleteItem(null);
      setOnConfirm(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDeleteItem(null);
    setOnConfirm(null);
  };

  const DeleteDialog = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={`Delete ${deleteItem?.type || "Item"}`}
      message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
  );

  return {
    showDeleteConfirmation,
    DeleteDialog,
  };
};
