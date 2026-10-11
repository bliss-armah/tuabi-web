import { useEffect, useRef } from "react";
import { useGetDebtorQuery } from "@/debtors/debtorApi";
import PaymentModal from "@/debtors/PaymentModal";
import ReminderModal from "@/reminders/ReminderModal";
import type { FormOutcome, FormRequest } from "./assistantParts";

export default function AssistantFormHost({
  request,
  onDone,
}: {
  request: FormRequest;
  onDone: (outcome: FormOutcome) => void;
}) {
  const savedRef = useRef(false);
  const { data, isError } = useGetDebtorQuery(request.debtorId);
  const debtor = data?.data;

  useEffect(() => {
    savedRef.current = false;
  }, [request]);

  useEffect(() => {
    if (isError) onDone("cancelled");
  }, [isError, onDone]);

  if (!debtor) return null;

  const markSaved = () => {
    savedRef.current = true;
  };
  const close = () => {
    setTimeout(() => onDone(savedRef.current ? "saved" : "cancelled"), 0);
  };

  if (request.kind === "payment") {
    return (
      <PaymentModal
        isOpen
        debtor={debtor}
        initialValues={request.values}
        onSaved={markSaved}
        onClose={close}
      />
    );
  }

  return (
    <ReminderModal
      isOpen
      mode="add"
      debtorId={debtor.id}
      debtorName={debtor.name}
      debtorAmountOwed={debtor.amountOwed}
      initialValues={request.values}
      onSuccess={markSaved}
      onClose={close}
    />
  );
}
