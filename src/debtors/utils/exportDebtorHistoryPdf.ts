export interface ExportHistoryEntry {
  action: string;
  amountChanged: number;
  note?: string | null;
  timestamp: string;
  user?: { name?: string };
}

export interface ExportDebtor {
  name: string;
  phoneNumber?: string;
  location?: string | null;
  description?: string;
  amountOwed: number;
  createdAt: string;
}

export interface ExportOptions {
  debtor: ExportDebtor;
  entries: ExportHistoryEntry[];
  workspaceName?: string | null;
  generatedBy?: string | null;
}

const PAYMENT_ACTIONS = new Set(["reduce", "settled"]);

const isPayment = (action: string) => PAYMENT_ACTIONS.has(action);

const ACTION_LABELS: Record<string, string> = {
  add: "Debt added",
  reduce: "Payment received",
  settled: "Settled",
  adjustment: "Adjustment",
};

const actionLabel = (action: string) =>
  ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1);

// The built-in PDF fonts use WinAnsi encoding, which has no glyph for the cedi
// sign, so amounts are written as "GHS" rather than a symbol that would drop out.
const money = (amount: number) =>
  `GHS ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const shortDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

const dateTime = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
};

const safeFilename = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "debtor";

export const exportDebtorHistoryPdf = async ({
  debtor,
  entries,
  workspaceName,
  generatedBy,
}: ExportOptions): Promise<void> => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  const oldestFirst = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let running = 0;
  const rows = oldestFirst.map((entry) => {
    running += isPayment(entry.action)
      ? -entry.amountChanged
      : entry.amountChanged;
    return [
      dateTime(entry.timestamp),
      actionLabel(entry.action),
      `${isPayment(entry.action) ? "-" : "+"}${money(entry.amountChanged)}`,
      money(running),
      entry.note?.trim() || "—",
      entry.user?.name?.trim() || "—",
    ];
  });

  const totalPaid = oldestFirst
    .filter((e) => isPayment(e.action))
    .reduce((sum, e) => sum + e.amountChanged, 0);
  const totalAdded = oldestFirst
    .filter((e) => !isPayment(e.action))
    .reduce((sum, e) => sum + e.amountChanged, 0);

  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(workspaceName?.trim() || "Tuabi", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  y += 16;
  doc.text("Debtor statement", margin, y);
  doc.text(
    `Generated ${dateTime(new Date().toISOString())}`,
    pageWidth - margin,
    y,
    { align: "right" },
  );
  if (generatedBy?.trim()) {
    y += 13;
    doc.text(`By ${generatedBy.trim()}`, pageWidth - margin, y, {
      align: "right",
    });
  }

  doc.setDrawColor(220);
  y += 12;
  doc.line(margin, y, pageWidth - margin, y);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  y += 24;
  doc.text(debtor.name, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);

  const details: Array<[string, string]> = [
    ["Phone", debtor.phoneNumber?.trim() || "—"],
    ["Location", debtor.location?.trim() || "—"],
    ["Customer since", shortDate(debtor.createdAt)],
  ];
  details.forEach(([label, value]) => {
    y += 15;
    doc.text(`${label}: ${value}`, margin, y);
  });

  const summary: Array<[string, string]> = [
    ["Outstanding balance", money(debtor.amountOwed)],
    ["Total debt added", money(totalAdded)],
    ["Total paid", money(totalPaid)],
    ["Transactions", String(oldestFirst.length)],
  ];
  let sy = y - details.length * 15;
  summary.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, pageWidth - margin, sy, { align: "right" });
    sy += 15;
  });

  y = Math.max(y, sy) + 18;

  if (rows.length === 0) {
    doc.setTextColor(110);
    doc.text("No transactions recorded for this debtor.", margin, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Date", "Type", "Amount", "Balance", "Note", "Recorded by"]],
      body: rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
      headStyles: { fillColor: [30, 30, 30], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [246, 246, 245] },
      columnStyles: {
        0: { cellWidth: 92 },
        1: { cellWidth: 78 },
        2: { cellWidth: 74, halign: "right" },
        3: { cellWidth: 74, halign: "right" },
        5: { cellWidth: 70 },
      },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
    doc.text(
      `${debtor.name} — statement`,
      margin,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  doc.save(
    `${safeFilename(debtor.name)}-statement-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`,
  );
};
