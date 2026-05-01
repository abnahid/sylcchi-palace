"use client";

import { api, toApiError } from "@/lib/api";
import { Fragment, useEffect, useRef, useState } from "react";

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** and *italic*, keep delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-1 pl-5">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const listMatch = line.match(/^[*\-•]\s+(.*)$/);
    if (listMatch) {
      listBuffer.push(listMatch[1]);
      return;
    }
    flushList(`list-${idx}`);
    if (line === "") {
      blocks.push(<div key={`br-${idx}`} className="h-1" />);
    } else {
      blocks.push(<p key={`p-${idx}`}>{renderInline(line)}</p>);
    }
  });
  flushList("list-end");

  return <div className="space-y-1">{blocks}</div>;
}

type ChatMessage = {
  role: "user" | "model";
  content: string;
};

const INITIAL_GREETING: ChatMessage = {
  role: "model",
  content:
    "Hi! I'm the Sylcchi Palace concierge. Ask me about room availability, prices, facilities or anything about your stay.",
};

const SUGGESTIONS = [
  "What rooms are available?",
  "Show me rooms for 2 guests",
  "What time is check-in?",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text?: string) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const payload = {
        messages: next
          .filter((m, i) => !(i === 0 && m === INITIAL_GREETING))
          .map((m) => ({ role: m.role, content: m.content })),
      };

      const response = await api.post<{
        success: boolean;
        data: { reply: string };
      }>("/chatbot/chat", payload, { timeout: 60_000 });

      const reply =
        response.data?.data?.reply?.trim() ||
        "Sorry, I couldn't generate a reply.";
      setMessages((prev) => [...prev, { role: "model", content: reply }]);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function resetChat() {
    setMessages([INITIAL_GREETING]);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="bg-primary hover:bg-primary/90 fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl ring-4 ring-white/40 transition hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="animate-in slide-in-from-bottom-4 fade-in fixed right-5 bottom-24 z-50 flex h-128 w-88 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#243443] bg-white dark:bg-[#101e2e] shadow-2xl duration-200">
          <div className="from-primary to-primary/85 flex items-center gap-3 bg-gradient-to-r px-4 py-3 text-white">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
              SP
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-tight font-semibold">
                Sylcchi Palace Concierge
              </p>
              <p className="text-[11px] opacity-90">
                Online · usually replies instantly
              </p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              aria-label="Reset chat"
              className="rounded-full p-1.5 transition hover:bg-white/15"
              title="New chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 dark:bg-[#0a1622] px-3 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`animate-in fade-in slide-in-from-bottom-1 flex duration-200 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary rounded-br-sm whitespace-pre-wrap text-white"
                      : "rounded-bl-sm border border-neutral-200 dark:border-[#243443] bg-white dark:bg-[#101e2e] text-neutral-800 dark:text-[#e8edf2]"
                  }`}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <FormattedMessage text={m.content} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="animate-in fade-in flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-neutral-200 dark:border-[#243443] bg-white dark:bg-[#101e2e] px-3.5 py-2.5 shadow-sm">
                  <span className="flex items-end gap-1">
                    <span className="bg-primary/70 inline-block h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-primary/70 inline-block h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-primary/70 inline-block h-2 w-2 animate-bounce rounded-full" />
                  </span>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendMessage(s)}
                    className="border-primary/30 text-primary dark:text-[#7fb3df] hover:bg-primary/10 rounded-full border bg-white dark:bg-[#101e2e] px-3 py-1 text-xs transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 dark:border-[#243443] bg-white dark:bg-[#101e2e] px-3 py-2.5">
            <div className="focus-within:border-primary focus-within:ring-primary/20 flex items-end gap-2 rounded-xl border border-neutral-200 dark:border-[#243443] bg-neutral-50 dark:bg-[#0a1622] px-2.5 py-1.5 transition focus-within:ring-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                rows={1}
                className="max-h-24 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-neutral-400 dark:text-[#e8edf2] dark:placeholder:text-[#5a6775]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || input.trim() === ""}
                aria-label="Send message"
                className="bg-primary hover:bg-primary/90 flex h-8 w-8 items-center justify-center rounded-full text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-neutral-400 dark:text-[#5a6775]">
              AI-powered · may occasionally be inaccurate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
