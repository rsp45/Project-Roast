"use client";

import { CornerDownLeft } from "lucide-react";
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
    <div className="rounded-2xl bg-panel p-6 text-panel-ink ring-1 ring-border">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-semibold">Interrogator</div>
        <div className="text-xs text-muted">
          {pending ? "Thinking..." : "Evidence-first answers"}
        </div>
      </div>

      <div className="mt-5 h-[360px] overflow-auto rounded-xl bg-panel/60 p-4 ring-1 ring-border">
        <div className="flex flex-col gap-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-accent px-4 py-3 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl bg-panel px-4 py-3 text-sm ring-1 ring-border"
              }
            >
              {m.content}
            </div>
          ))}
        </div>
      </div>

      <form
        className="mt-4 flex items-center gap-3"
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
          className="h-11 flex-1 rounded-xl bg-background px-4 text-sm ring-1 ring-border placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-panel-ink px-4 text-sm font-semibold text-panel transition-colors hover:bg-panel-ink/90"
        >
          <CornerDownLeft className="h-4 w-4" />
          Ask
        </button>
      </form>
    </div>
  );
}
