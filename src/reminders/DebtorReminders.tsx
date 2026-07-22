import { useState } from "react";
import {
  useGetDebtorRemindersQuery,
  useDeleteReminderMutation,
} from "@/reminders/remindersApi";
import type { Reminder } from "@/reminders/remindersApi";
import { showReminderError } from "@/shared/utils/toastConfig";
import { useDeleteConfirmation } from "@/shared/components/ConfirmDialog";
import ReminderModal from "@/reminders/ReminderModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Repeat,
  CheckCircle2,
} from "lucide-react";

interface DebtorRemindersProps {
  debtorId: number;
  debtorName: string;
}

export default function DebtorReminders({
  debtorId,
  debtorName,
}: DebtorRemindersProps) {
  const { showDeleteConfirmation, DeleteDialog } = useDeleteConfirmation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<
    Reminder | undefined
  >();

  const {
    data: remindersData,
    isLoading,
    error,
    refetch,
  } = useGetDebtorRemindersQuery(debtorId);

  const [deleteReminder] = useDeleteReminderMutation();


  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setModalVisible(true);
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    showDeleteConfirmation(reminder.id, reminder.title, "Reminder", () => {
      deleteReminder(reminder.id)
        .unwrap()
        .then(() => {
          refetch();
        })
        .catch((err: any) => {
          showReminderError(err?.data?.message || "Failed to delete reminder");
        });
    });
  };

  const handleCreateReminder = () => {
    setEditingReminder(undefined);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPastDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    return dueDate < now;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "ONCE":
        return "One-time";
      case "DAILY":
        return "Daily repeat";
      case "WEEKLY":
        return "Weekly repeat";
      default:
        return "One-time";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Failed to Load Reminders
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            There was an error loading reminders.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Reminders</h3>
        <Button onClick={handleCreateReminder} size="sm">
          <Plus className="h-4 w-4" />
          Set Reminder
        </Button>
      </div>

      {/* Reminders List */}
      {remindersData?.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Clock className="mb-4 h-10 w-10 text-muted-foreground" />
            <h4 className="mb-1 text-base font-semibold text-foreground">
              No Reminders Set
            </h4>
            <p className="text-sm text-muted-foreground">
              Set reminders to follow up on payments for {debtorName}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {remindersData?.data.map((reminder) => {
            const overdue = isPastDue(reminder.dueDate) && !reminder.isCompleted;
            const isRecurring = reminder.reminderFrequency !== "ONCE";
            return (
              <Card
                key={reminder.id}
                className={
                  overdue
                    ? "border-destructive/40 bg-destructive/5 transition-all"
                    : "transition-all hover:shadow-md"
                }
              >
                <CardContent className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {reminder.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : overdue ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-medium text-foreground">
                        {reminder.title}
                      </h4>
                      {reminder.isCompleted && (
                        <Badge
                          variant="secondary"
                          className="bg-success/15 text-success"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                      {overdue && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                      {isRecurring && (
                        <Badge variant="outline">
                          <Repeat className="h-3 w-3" />
                          {getFrequencyLabel(reminder.reminderFrequency)}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {reminder.message}
                    </p>

                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Due: {formatDate(reminder.dueDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditReminder(reminder)}
                      title="Edit reminder"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit reminder</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteReminder(reminder)}
                      title="Delete reminder"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete reminder</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingReminder(undefined);
        }}
        mode={editingReminder ? "edit" : "add"}
        reminder={editingReminder}
        debtorId={debtorId}
        debtorName={debtorName}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  );
}
