import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  showReminderSuccess,
  showReminderError,
} from "@/shared/utils/toastConfig";
import {
  useCreateReminderMutation,
  useUpdateReminderMutation,
} from "@/reminders/remindersApi";
import type { Reminder } from "@/reminders/remindersApi";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Clock, AlertTriangle, Loader2 } from "lucide-react";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  dueDate: z.date(),
  reminderFrequency: z.enum(["ONCE", "DAILY", "WEEKLY"], {
    message: "Please select a frequency",
  }),
});

type FormData = z.infer<typeof reminderSchema>;

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  reminder?: Reminder;
  debtorId?: number;
  debtorName?: string;
  onSuccess?: () => void;
}

export default function ReminderModal({
  isOpen,
  onClose,
  mode,
  reminder,
  debtorId,
  debtorName,
  onSuccess,
}: ReminderModalProps) {
  const [createReminder, { isLoading: isCreating }] =
    useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] =
    useUpdateReminderMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(reminderSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      message: "",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reminderFrequency: "ONCE" as const,
    },
  });

  const watchedDueDate = watch("dueDate");
  const watchedFrequency = watch("reminderFrequency");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && reminder) {
        reset({
          title: reminder.title,
          message: reminder.message,
          dueDate: new Date(reminder.dueDate),
          reminderFrequency: reminder.reminderFrequency,
        });
      } else {
        reset({
          title: "",
          message: "",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          reminderFrequency: "ONCE",
        });
      }
    }
  }, [isOpen, mode, reminder, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add" && debtorId) {
        await createReminder({
          debtorId,
          title: data.title,
          message: data.message,
          dueDate: data.dueDate.toISOString(),
          reminderFrequency: data.reminderFrequency,
        }).unwrap();
        showReminderSuccess("Reminder created successfully!");
      } else if (mode === "edit" && reminder) {
        await updateReminder({
          id: reminder.id,
          data: {
            title: data.title,
            message: data.message,
            dueDate: data.dueDate.toISOString(),
            reminderFrequency: data.reminderFrequency,
          },
        }).unwrap();
        showReminderSuccess("Reminder updated successfully!");
      }

      onClose();
      onSuccess?.();
    } catch (err: any) {
      showReminderError(err?.data?.message || "Something went wrong");
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Reminder" : "Edit Reminder"}
          </DialogTitle>
          <DialogDescription>
            Setting reminder for{" "}
            <span className="font-medium text-foreground">{debtorName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="reminder-title">Title *</Label>
            <Input
              id="reminder-title"
              {...register("title")}
              type="text"
              placeholder="e.g., Follow up on overdue payment"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <div className="flex items-center text-xs text-destructive">
                <AlertTriangle className="mr-1 h-4 w-4" />
                {errors.title.message}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="reminder-message">Message *</Label>
            <Textarea
              id="reminder-message"
              {...register("message")}
              placeholder="e.g., Please contact regarding the outstanding payment of GH₵500"
              rows={3}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <div className="flex items-center text-xs text-destructive">
                <AlertTriangle className="mr-1 h-4 w-4" />
                {errors.message.message}
              </div>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label htmlFor="reminder-frequency">Reminder Frequency *</Label>
            <Select
              value={watchedFrequency}
              onValueChange={(value) =>
                setValue(
                  "reminderFrequency",
                  value as FormData["reminderFrequency"],
                  { shouldValidate: true, shouldDirty: true }
                )
              }
            >
              <SelectTrigger id="reminder-frequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONCE">Once (single reminder)</SelectItem>
                <SelectItem value="DAILY">
                  Daily (repeat daily if overdue)
                </SelectItem>
                <SelectItem value="WEEKLY">
                  Weekly (repeat weekly if overdue)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.reminderFrequency && (
              <div className="flex items-center text-xs text-destructive">
                <AlertTriangle className="mr-1 h-4 w-4" />
                {errors.reminderFrequency.message}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {watchedFrequency === "ONCE" &&
                "Reminder will be sent once on the due date"}
              {watchedFrequency === "DAILY" &&
                "Reminder will repeat every day after due date until marked complete"}
              {watchedFrequency === "WEEKLY" &&
                "Reminder will repeat every week after due date until marked complete"}
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="reminder-due-date">Due Date &amp; Time *</Label>
            <Input
              id="reminder-due-date"
              type="datetime-local"
              value={
                watchedDueDate
                  ? new Date(
                      watchedDueDate.getTime() -
                        watchedDueDate.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                if (e.target.value) {
                  setValue("dueDate", new Date(e.target.value), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              aria-invalid={!!errors.dueDate}
            />
            {watchedDueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {formatDateTime(watchedDueDate)}
              </div>
            )}
            {errors.dueDate && (
              <div className="flex items-center text-xs text-destructive">
                <AlertTriangle className="mr-1 h-4 w-4" />
                {errors.dueDate.message}
              </div>
            )}
          </div>

          {/* Buttons */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "add" ? (
                "Create Reminder"
              ) : (
                "Update Reminder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
