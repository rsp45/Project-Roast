"use client";

import { CornerDownLeft, Brain } from "lucide-react";
import { useState } from "react";
import { backendFetch } from "@/lib/backend";

type Message = { role: "user" | "assistant"; content: string };

const starter: Message[] = [
  {
    role: "assistant",
    content:
      "Ask a question about your imported trades. Answers will cite evidence (trades + metrics).",
  },
];

export function AskPanel() {
  const [messages, setMessages] = useState<Message[]>(starter);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-stack-md relative overflow-hidden border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-baseline justify-between gap-4 mb-stack-md">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary-container" />
          <h2 className="font-headline-sm text-[20px] font-semibold text-on-surface tracking-tight">
            Interrogator
          </h2>
        </div>
        <div className="font-label-mono text-[12px] text-secondary">
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse bg-primary-container h-2 w-2 rounded-full"></span>
              Thinking...
            </span>
          ) : (
            "Evidence-first answers"
          )}
        </div>
      </div>

      <div className="h-[400px] overflow-auto rounded-xl bg-surface-container-low/50 p-4 border border-white/5 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-none bg-primary-container/20 border border-primary-container/50 px-4 py-3 text-sm text-on-surface font-body-md"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-tl-none bg-surface border border-white/5 px-4 py-3 text-sm text-on-surface-variant font-body-md"
              }
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      </div>

      <form
        className="mt-4 flex items-center gap-3 relative"
        onSubmit={async (e) => {
          e.preventDefault();
          const q = text.trim();
          if (!q) return;
          setPending(true);
          setText("");
          setMessages((prev) => [...prev, { role: "user", content: q }]);
          try {
            const data = await backendFetch<{
              answer: string;
              followUps: string[];
              evidence: { trades?: Array<{ symbol: string; pnl: number | null }> };
            }>("/v1/ask", {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({ question: q }),
            });

            const evidenceLine = data.evidence?.trades?.length
              ? `Evidence: ${data.evidence.trades.length} trades.`
              : "";

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `${data.answer}${evidenceLine ? `\n\n${evidenceLine}` : ""}`,
              },
            ]);
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  err instanceof Error
                    ? `Request failed: ${err.message}`
                    : "Request failed.",
              },
            ]);
          } finally {
            setPending(false);
          }
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try: "Why did April underperform?"'
          className="h-12 flex-1 rounded-xl bg-surface-container-low px-4 text-[15px] font-body-md text-on-surface border border-white/10 placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary-container transition-colors hover:bg-primary-container/90 disabled:opacity-50"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
