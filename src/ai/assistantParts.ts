import type { UIMessage } from "ai";
import type { PaymentAction, PaymentFormValues } from "@/debtors/PaymentModal";
import type { ReminderFormValues } from "@/reminders/ReminderModal";

export type FormToolName = "openPaymentForm" | "openReminderForm";
export type FormOutcome = "saved" | "cancelled";

export type FormRequest =
  | {
      kind: "payment";
      debtorId: number;
      values: PaymentFormValues;
      toolCallId?: string;
    }
  | {
      kind: "reminder";
      debtorId: number;
      values: ReminderFormValues;
      toolCallId?: string;
    };

export type FollowUp =
  | { label: string; kind: "ask" }
  | { label: string; kind: "form"; request: FormRequest };

type NamedRow = { id?: number; name?: string };

type ToolInput = {
  debtorId?: number;
  action?: PaymentAction;
  amount?: number;
  note?: string;
  title?: string;
  message?: string;
  dueDate?: string;
  tone?: string;
};

type ToolOutput = {
  found?: boolean;
  id?: number;
  name?: string;
  estimatedNextPaymentDate?: string;
  nameIsAmbiguous?: boolean;
  debtors?: NamedRow[];
  next7Days?: { debtors?: NamedRow[] };
  shown?: boolean;
  debtorName?: string;
  outcome?: FormOutcome;
};

export type ToolPart = {
  type: string;
  toolCallId: string;
  state: string;
  input?: ToolInput;
  output?: ToolOutput;
};

export const asToolPart = (part: unknown) => part as ToolPart;

type NamedDebtor = { id: number; name: string };

const MAX_FOLLOW_UPS = 3;

const toolParts = (message: UIMessage): ToolPart[] =>
  message.parts.filter((part) => part.type.startsWith("tool-")) as ToolPart[];

const findTool = (message: UIMessage, name: string) =>
  toolParts(message).filter((part) => part.type === `tool-${name}`);

const outputOf = (message: UIMessage, name: string) =>
  findTool(message, name).find((part) => part.state === "output-available")?.output;

export const formToolName = (request: FormRequest): FormToolName =>
  request.kind === "payment" ? "openPaymentForm" : "openReminderForm";

export const dateFromIsoDay = (isoDay: string) => new Date(`${isoDay}T09:00:00`);

const toFormRequest = (part: ToolPart): FormRequest | null => {
  const input = part.input ?? {};
  if (typeof input.debtorId !== "number") return null;
  if (part.type === "tool-openPaymentForm") {
    return {
      kind: "payment",
      debtorId: input.debtorId,
      toolCallId: part.toolCallId,
      values: { action: input.action ?? "reduce", amount: input.amount, note: input.note },
    };
  }
  return {
    kind: "reminder",
    debtorId: input.debtorId,
    toolCallId: part.toolCallId,
    values: {
      title: input.title,
      message: input.message,
      dueDate: input.dueDate ? dateFromIsoDay(input.dueDate) : undefined,
    },
  };
};

export const pendingFormRequest = (messages: UIMessage[]): FormRequest | null => {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return null;
  const pending = toolParts(last).find(
    (part) =>
      (part.type === "tool-openPaymentForm" || part.type === "tool-openReminderForm") &&
      part.state === "input-available",
  );
  return pending ? toFormRequest(pending) : null;
};

export const draftOf = (part: ToolPart) =>
  typeof part.input?.message === "string" && typeof part.input?.debtorId === "number"
    ? {
        debtorId: part.input.debtorId as number,
        message: part.input.message as string,
        tone: part.input.tone as string | undefined,
      }
    : null;

const focusedDebtor = (message: UIMessage): NamedDebtor | null => {
  for (const name of ["getDebtorDetails", "getPaymentPattern"]) {
    const output = outputOf(message, name);
    if (output?.found && typeof output.id === "number" && output.name) {
      return { id: output.id, name: output.name };
    }
  }
  const draft = findTool(message, "presentMessageDraft").find(
    (part) => part.state === "output-available" && part.output?.shown,
  );
  if (draft?.input?.debtorId && draft.output?.debtorName) {
    return { id: draft.input.debtorId, name: draft.output.debtorName };
  }
  return null;
};

const firstName = (debtors: NamedRow[] | undefined): string | null =>
  debtors?.[0]?.name ?? null;

const ask = (label: string): FollowUp => ({ label, kind: "ask" });

const debtorFollowUps = (message: UIMessage, debtor: NamedDebtor): FollowUp[] => {
  const savedForm = findTool(message, "openPaymentForm").some(
    (part) => part.output?.outcome === "saved",
  );
  if (savedForm) return [ask(`Draft a thank-you message to ${debtor.name}`)];

  const draft = findTool(message, "presentMessageDraft")
    .map(draftOf)
    .find(Boolean);
  if (draft) {
    return [
      {
        label: "Save as reminder",
        kind: "form",
        request: {
          kind: "reminder",
          debtorId: debtor.id,
          values: { title: `Follow up with ${debtor.name}`, message: draft.message },
        },
      },
      ask(draft.tone === "gentle" ? "Make it firmer" : "Make it gentler"),
    ];
  }

  const pattern = outputOf(message, "getPaymentPattern");
  const recordPayment: FollowUp = {
    label: "Record payment",
    kind: "form",
    request: { kind: "payment", debtorId: debtor.id, values: { action: "reduce" } },
  };
  if (pattern?.estimatedNextPaymentDate) {
    return [
      {
        label: "Remind me then",
        kind: "form",
        request: {
          kind: "reminder",
          debtorId: debtor.id,
          values: {
            title: `Expected payment from ${debtor.name}`,
            dueDate: dateFromIsoDay(pattern.estimatedNextPaymentDate),
          },
        },
      },
      recordPayment,
      ask(`Draft a reminder to ${debtor.name}`),
    ];
  }
  return [
    recordPayment,
    ask(`Draft a reminder to ${debtor.name}`),
    ask(`When will ${debtor.name} likely pay?`),
  ];
};

const topicFollowUps = (message: UIMessage): FollowUp[] => {
  const draftFor = (name: string | null) =>
    name ? [ask(`Draft a reminder to ${name}`)] : [];

  const overdue = outputOf(message, "getOverdueDebts");
  if (overdue) {
    return [...draftFor(firstName(overdue.debtors)), ask("Who's high risk?"), ask("How old are my debts?")];
  }
  const stale = outputOf(message, "getStaleDebtors");
  if (stale) {
    return [...draftFor(firstName(stale.debtors)), ask("Which debts are overdue?"), ask("How old are my debts?")];
  }
  const risk = outputOf(message, "getRiskAlerts");
  if (risk) {
    return [...draftFor(firstName(risk.debtors)), ask("Which debts are overdue?")];
  }
  const forecast = outputOf(message, "getCollectionForecast");
  if (forecast) {
    return [
      ...draftFor(firstName(forecast.next7Days?.debtors)),
      ask("Which debts are overdue?"),
    ];
  }
  if (outputOf(message, "getDebtAging")) {
    return [ask("Who hasn't paid in 60 days?"), ask("Which debts are overdue?")];
  }
  if (outputOf(message, "getPaymentActivity")) {
    return [ask("Compare with the period before"), ask("Who hasn't paid in 30 days?")];
  }
  if (outputOf(message, "getOverview")) {
    return [ask("Which debts are overdue?"), ask("How much did I collect last month?"), ask("Who owes me the most?")];
  }
  if (outputOf(message, "getRecentActivity")) {
    return [ask("How much did I collect this week?"), ask("Which debts are overdue?")];
  }
  if (outputOf(message, "getReminders")) {
    return [ask("Which debts are overdue?")];
  }
  return [];
};

export const followUpsFor = (message: UIMessage | undefined): FollowUp[] => {
  if (!message || message.role !== "assistant") return [];
  if (outputOf(message, "findDebtors")?.nameIsAmbiguous) return [];
  const debtor = focusedDebtor(message);
  const followUps = debtor ? debtorFollowUps(message, debtor) : topicFollowUps(message);
  return followUps.slice(0, MAX_FOLLOW_UPS);
};
