import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedAction?: string;
  intent?: string;
}

const quickMessages = [
  { text: "What services do you offer?", icon: "🛠️" },
  { text: "Show me case studies", icon: "📊" },
  { text: "How does your process work?", icon: "⚙️" },
  { text: "I want to book a call", icon: "📅" },
];

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL as string | undefined;

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
      if (!webhookUrl) {
        throw new Error("Missing VITE_N8N_CHAT_WEBHOOK_URL");
      }

      const response = await fetch(webhookUrl, {
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

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
          content:
            "Sorry, I'm having trouble connecting. Please try again or use the contact form at /contact.",
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-blue-100 mt-0.5">Ask me about automation services</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.length === 0 && (
              <div className="text-center mt-8 space-y-4">
                <div className="text-5xl">👋</div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                    Hi! I'm Jeffery's AI assistant.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 px-4">
                    I can help you learn about AI automation services, pricing, and process.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 px-2">
                  {quickMessages.map((msg) => (
                    <button
                      key={msg.text}
                      onClick={() => setInput(msg.text)}
                      className="p-3 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left border border-gray-200 dark:border-gray-600 group"
                    >
                      <div className="text-2xl mb-1">{msg.icon}</div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">{msg.text}</div>
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
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                  } p-4 rounded-2xl shadow-sm`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {msg.suggestedAction &&
                    msg.suggestedAction !== "none" &&
                    msg.suggestedAction !== "continue_chat" && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {msg.suggestedAction === "book_call" && (
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            <span>Book a Free ROI Audit</span>
                          </a>
                        )}
                        {msg.suggestedAction === "view_case_studies" && (
                          <a
                            href="/projects"
                            className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            <span>View Case Studies</span>
                          </a>
                        )}
                        {msg.suggestedAction === "contact_form" && (
                          <a
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition group"
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
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-2xl shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
              >
                <span className="hidden sm:inline">Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Powered by n8n & OpenAI</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
