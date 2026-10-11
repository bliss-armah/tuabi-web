export type AssistantPage = "dashboard" | "debtors" | "debtor" | "history" | "other";

export type AssistantPageContext = { page: AssistantPage; debtorId?: number };

export const pageContextFromPath = (pathname: string): AssistantPageContext => {
  if (pathname === "/") return { page: "dashboard" };
  if (pathname === "/debtors") return { page: "debtors" };
  const debtorMatch = pathname.match(/^\/debtors\/(\d+)$/);
  if (debtorMatch) return { page: "debtor", debtorId: Number(debtorMatch[1]) };
  if (pathname.startsWith("/history")) return { page: "history" };
  return { page: "other" };
};

export const startersFor = (
  context: AssistantPageContext,
  debtorName?: string,
): string[] => {
  if (context.page === "debtor" && debtorName) {
    return [
      `How is ${debtorName} doing?`,
      `When will ${debtorName} likely pay?`,
      `Draft a reminder to ${debtorName}`,
    ];
  }
  if (context.page === "history") {
    return [
      "What happened today?",
      "How much did I collect last month?",
      "Who recorded the most this week?",
    ];
  }
  if (context.page === "debtors") {
    return [
      "Who owes me the most?",
      "Who hasn't paid in 30 days?",
      "How old are my debts?",
    ];
  }
  return [
    "How's this week looking?",
    "Which debts are overdue?",
    "How much did I collect last month?",
  ];
};
