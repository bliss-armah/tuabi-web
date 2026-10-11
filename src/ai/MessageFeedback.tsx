import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { sendAssistantFeedback } from "./assistantChat";

type Status = "idle" | "askingWhy" | "thanks";

const submitted = new Map<string, Status>();

export default function MessageFeedback({
  messageId,
  question,
  answer,
}: {
  messageId: string;
  question: string;
  answer: string;
}) {
  const [status, setStatus] = useState<Status>(submitted.get(messageId) ?? "idle");
  const [comment, setComment] = useState("");

  const update = (next: Status) => {
    submitted.set(messageId, next);
    setStatus(next);
  };

  const send = (rating: "up" | "down", note?: string) => {
    sendAssistantFeedback({
      messageId,
      rating,
      comment: note || undefined,
      question: question.slice(0, 1000),
      answer: answer.slice(0, 2000),
    }).catch(() => undefined);
  };

  if (status === "thanks") {
    return <p className="mt-1 text-[11px] text-muted-foreground">Thanks for the feedback</p>;
  }

  if (status === "askingWhy") {
    return (
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send("down", comment.trim());
          update("thanks");
        }}
      >
        <input
          autoFocus
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="What was wrong? (optional)"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          Send
        </button>
      </form>
    );
  }

  return (
    <div className="mt-1 flex gap-1 text-muted-foreground">
      <button
        type="button"
        aria-label="Good answer"
        onClick={() => {
          send("up");
          update("thanks");
        }}
        className="rounded p-1 transition-colors hover:bg-muted hover:text-foreground"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Bad answer"
        onClick={() => update("askingWhy")}
        className="rounded p-1 transition-colors hover:bg-muted hover:text-foreground"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
