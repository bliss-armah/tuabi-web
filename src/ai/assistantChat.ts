import { Chat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { getBaseUrl } from "@/config/api";
import type { AssistantPageContext } from "./pageContext";

const OPEN_EVENT = "tuabi:assistant-open";

let pageContext: AssistantPageContext = { page: "other" };

export const setAssistantPageContext = (context: AssistantPageContext) => {
  pageContext = context;
};

export const openAssistant = () => window.dispatchEvent(new Event(OPEN_EVENT));

export const onAssistantOpenRequest = (handler: () => void) => {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createAssistantChat = () =>
  new Chat<UIMessage>({
    transport: new DefaultChatTransport({
      api: `${getBaseUrl()}/ai/chat`,
      credentials: "include",
      headers: authHeaders,
      body: () => ({ context: pageContext }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

let current: { userKey: string; chat: Chat<UIMessage> } | null = null;

export const getAssistantChat = (userKey: string) => {
  if (current?.userKey !== userKey) {
    current = { userKey, chat: createAssistantChat() };
  }
  return current.chat;
};

export const describeChatError = (error: Error) => {
  try {
    const parsed = JSON.parse(error.message);
    if (typeof parsed?.message === "string") return parsed.message;
    if (typeof parsed?.error === "string") return parsed.error;
  } catch {
    if (error.message && !error.message.startsWith("<")) return error.message;
  }
  return "Something went wrong. Please try again.";
};
