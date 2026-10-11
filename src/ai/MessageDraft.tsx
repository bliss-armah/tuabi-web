import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useGetDebtorQuery } from "@/debtors/debtorApi";
import { whatsAppLink } from "./whatsapp";

export default function MessageDraft({
  debtorId,
  message,
}: {
  debtorId: number;
  message: string;
}) {
  const [copied, setCopied] = useState(false);
  const { data } = useGetDebtorQuery(debtorId);
  const phoneNumber = data?.data.phoneNumber;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="whitespace-pre-wrap text-sm">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        {phoneNumber && (
          <a
            href={whatsAppLink(phoneNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
