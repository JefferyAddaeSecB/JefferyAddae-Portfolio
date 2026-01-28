import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedAction?: string;
  intent?: string;
}

const quickMessages = [
  { text: "What services do you offer?", emoji: "🧩" },
  { text: "How does your process work?", emoji: "🛠️" },
  { text: "I want to book a call", emoji: "📅" },
];

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem("chat_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      return;
    }
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    window.localStorage.setItem("chat_session_id", newSessionId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const chatEndpoint = `${apiBaseUrl}/api/chat`;
      console.log("Sending to:", chatEndpoint);

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: currentInput,
          context: {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      console.log("Chat response:", data);

      if (!data?.success) {
        throw new Error(data?.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        suggestedAction: data.suggestedAction,
        intent: data.intent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Thanks for reaching out. I’ll share relevant examples shortly. In the meantime, what kind of automation are you most interested in?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-sky-600 text-white rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-8rem)] bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 border border-white/40 dark:border-white/10">
          <div className="bg-sky-600 text-white px-4 py-3.5 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 3h4.5m-6 3h7.5M7 9.5a5 5 0 0110 0v1.5a2 2 0 002 2h-14a2 2 0 002-2V9.5zM9 16.5h6M8 20h8"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm tracking-tight">AI Assistant</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                      BETA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/85">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                    <span>Online &amp; Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition"
                  aria-label="Reset chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.9-3M4 16a8 8 0 0014.9 3"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/90 dark:bg-slate-900/70 shadow-inner">
            {messages.length === 0 && (
              <div className="text-center mt-8 space-y-4">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                    Hi! I’m Jeffery’s AI assistant 👋
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">
                    Happy to help with automation, pricing, timelines, or next steps. What would you like to explore?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 px-2">
                  {quickMessages.map((msg) => (
                    <button
                      key={msg.text}
                      onClick={() => setInput(msg.text)}
                      className="p-3 bg-white/80 dark:bg-slate-800/70 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition text-left border border-slate-200/70 dark:border-white/10 shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                        <span className="text-base">{msg.emoji}</span>
                        <span>{msg.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={`${msg.timestamp}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white shadow-[0_12px_30px_-18px_rgba(14,116,144,0.6)]"
                      : "bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-white/10"
                  } p-4 rounded-2xl shadow-sm backdrop-blur`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {msg.suggestedAction &&
                    msg.suggestedAction !== "none" &&
                    msg.suggestedAction !== "continue_chat" && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {msg.suggestedAction === "book_call" && (
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200 font-semibold transition group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            <span>Book a Free ROI Audit</span>
                          </a>
                        )}
                        {msg.suggestedAction === "view_case_studies" && (
                          <a
                            href="/projects"
                            className="inline-flex items-center gap-2 text-xs text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200 font-semibold transition group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            <span>View Case Studies</span>
                          </a>
                        )}
                        {msg.suggestedAction === "contact_form" && (
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200 font-semibold transition group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            <span>Send a Message</span>
                          </a>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 p-4 rounded-2xl shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3.5 border-t border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] px-2 py-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Jeffrey’s work..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-9 w-12 rounded-xl bg-sky-600/90 text-white/90 border border-white/50 shadow-sm hover:shadow-md hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center backdrop-blur"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-400/80 dark:text-slate-500 mt-2 text-center">
              ⚡ Powered by n8n and openAI· Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
