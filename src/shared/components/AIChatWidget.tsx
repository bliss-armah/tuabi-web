import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import {
  describeChatError,
  getAssistantChat,
  onAssistantOpenRequest,
  setAssistantPageContext,
} from "@/ai/assistantChat";
import {
  asToolPart,
  draftOf,
  followUpsFor,
  formToolName,
  pendingFormRequest,
  type FollowUp,
  type FormOutcome,
  type FormRequest,
  type ToolPart,
} from "@/ai/assistantParts";
import { pageContextFromPath, startersFor } from "@/ai/pageContext";
import { toolLabel } from "@/ai/toolLabels";
import AssistantFormHost from "@/ai/AssistantFormHost";
import MessageDraft from "@/ai/MessageDraft";
import { useGetDebtorQuery } from "@/debtors/debtorApi";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children }) => <span className="underline">{children}</span>,
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/60 px-2 py-1 align-top">{children}</td>
  ),
};

const FORM_STATUS: Record<string, { pending: string; saved: string; cancelled: string }> = {
  openPaymentForm: {
    pending: "Opening the payment form…",
    saved: "Saved in the app",
    cancelled: "Payment form closed",
  },
  openReminderForm: {
    pending: "Opening the reminder form…",
    saved: "Reminder saved",
    cancelled: "Reminder form closed",
  },
};

function StatusLine({ icon, text }: { icon: "done" | "closed" | "working"; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon === "done" && <Check className="h-3 w-3" />}
      {icon === "closed" && <X className="h-3 w-3" />}
      {icon === "working" && <Loader2 className="h-3 w-3 animate-spin" />}
      {text}
    </div>
  );
}

function ToolPartView({ part }: { part: ToolPart }) {
  const toolName = part.type.replace(/^tool-/, "");
  const formLabels = FORM_STATUS[toolName];
  if (formLabels) {
    const outcome = part.output?.outcome;
    if (!outcome) return <StatusLine icon="working" text={formLabels.pending} />;
    return (
      <StatusLine
        icon={outcome === "saved" ? "done" : "closed"}
        text={formLabels[outcome]}
      />
    );
  }
  if (toolName === "presentMessageDraft") {
    const draft = draftOf(part);
    const rejected = part.state === "output-available" && !part.output?.shown;
    if (!draft || rejected || part.state === "input-streaming") return null;
    return <MessageDraft debtorId={draft.debtorId} message={draft.message} />;
  }
  if (part.state === "output-available") return null;
  return part.state === "output-error" ? (
    <StatusLine icon="closed" text="Couldn't load that data" />
  ) : (
    <StatusLine icon="working" text={`${toolLabel(toolName)}…`} />
  );
}

function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="space-y-2">
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {part.text}
            </ReactMarkdown>
          );
        }
        if (!isToolUIPart(part)) return null;
        return (
          <ToolPartView
            key={index}
            part={{ ...asToolPart(part), type: `tool-${getToolName(part)}` }}
          />
        );
      })}
    </div>
  );
}

function messageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
    >
      {label}
    </button>
  );
}

export default function AIChatWidget({ userId }: { userId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [directForm, setDirectForm] = useState<FormRequest | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pageContext = useMemo(
    () => pageContextFromPath(location.pathname),
    [location.pathname],
  );
  const { data: viewedDebtor } = useGetDebtorQuery(pageContext.debtorId ?? 0, {
    skip: !pageContext.debtorId,
  });
  const viewedDebtorName = pageContext.debtorId ? viewedDebtor?.data.name : undefined;

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    clearError,
    addToolOutput,
  } = useChat({ chat: getAssistantChat(String(userId)) });

  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const waitingForFirstToken =
    status === "submitted" || (busy && lastMessage?.role === "user");
  const toolForm = useMemo(() => pendingFormRequest(messages), [messages]);
  const activeForm = directForm ?? (busy ? null : toolForm);
  const followUps = busy || error || activeForm ? [] : followUpsFor(lastMessage);

  useEffect(() => {
    setAssistantPageContext(pageContext);
  }, [pageContext]);

  useEffect(() => onAssistantOpenRequest(() => setIsOpen(true)), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, status]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (error) clearError();
    sendMessage({ text: trimmed });
    setInput("");
  };

  const finishForm = useCallback(
    (outcome: FormOutcome) => {
      if (directForm) {
        setDirectForm(null);
        return;
      }
      if (toolForm?.toolCallId) {
        addToolOutput({
          tool: formToolName(toolForm),
          toolCallId: toolForm.toolCallId,
          output: { outcome },
        });
      }
    },
    [directForm, toolForm, addToolOutput],
  );

  const runFollowUp = (followUp: FollowUp) => {
    if (followUp.kind === "form") setDirectForm(followUp.request);
    else send(followUp.label);
  };

  return (
    <>
      {activeForm && <AssistantFormHost request={activeForm} onDone={finishForm} />}
      <div className="fixed bottom-24 right-4 z-50 lg:bottom-8 lg:right-8">
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex h-130 max-h-[70vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Tuabi Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-white/15"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4">
              {messages.length === 0 && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Ask me about your debtors, or tell me what happened, like
                    “Ama paid 200”, and I'll open the right form for you.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {startersFor(pageContext, viewedDebtorName).map((starter) => (
                      <Chip key={starter} label={starter} onClick={() => send(starter)} />
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {messageText(message)}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[95%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm text-card-foreground">
                      <AssistantMessage message={message} />
                    </div>
                  </div>
                ),
              )}

              {followUps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {followUps.map((followUp) => (
                    <Chip
                      key={followUp.label}
                      label={followUp.label}
                      onClick={() => runFollowUp(followUp)}
                    />
                  ))}
                </div>
              )}

              {waitingForFirstToken && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <div
                          key={delay}
                          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span>{describeChatError(error)}</span>
                  <button
                    onClick={() => regenerate()}
                    className="flex shrink-0 items-center gap-1 font-medium underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {viewedDebtorName && (
              <div className="border-t border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                Viewing <span className="font-medium text-foreground">{viewedDebtorName}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 border-t border-border bg-card p-3"
            >
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask, or tell me what happened…"
                maxLength={500}
              />
              {busy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => stop()}
                  aria-label="Stop"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label={isOpen ? "Close assistant" : "Open assistant"}
        >
          {isOpen ? <X className="size-6" /> : <MessageSquare className="size-6" />}
        </Button>
      </div>
    </>
  );
}
