'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: string;
  intent?: string;
}

const NUDGE_KEY = 'jeffrey_chat_nudge_dismissed_v1';
const OPENED_KEY = 'jeffrey_chat_opened_v1';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, []);

  return isMobile;
}

function ChatNudge({ isChatOpen }: { isChatOpen: boolean }) {
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = sessionStorage.getItem(NUDGE_KEY) === '1';
    const opened = sessionStorage.getItem(OPENED_KEY) === '1';
    if (dismissed || opened || isChatOpen) return;

    const hasScrolledFar =
      window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight) > 0.3;
    if (hasScrolledFar) return;

    const delay = isMobile ? 9000 : 4500;
    const timer = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(timer);
  }, [isChatOpen, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isChatOpen) {
      sessionStorage.setItem(OPENED_KEY, '1');
      setShow(false);
    }
  }, [isChatOpen]);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(NUDGE_KEY, '1');
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed z-50 max-w-[260px] ${
        isMobile ? 'bottom-24 right-4' : 'bottom-24 right-6'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900/95">
        <button
          onClick={dismiss}
          aria-label="Dismiss help nudge"
          className="absolute right-2 top-1 text-lg leading-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Need help?</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          Questions about automation? I can help.
        </p>
      </div>
      <div className="ml-auto mr-6 h-2.5 w-2.5 -translate-y-[1px] rotate-45 border-b border-r border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95" />
    </div>
  );
}

function AiSystemAvatar({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div
      className={`${className} relative overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      <span className="absolute inset-1 rounded-full bg-white/20 blur-[2px]" />
      <svg
        className="relative z-10 h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.5V6" />
        <rect x="6" y="6" width="12" height="10.5" rx="3" />
        <path d="M6 10.8H4.5" />
        <path d="M19.5 10.8H18" />
        <circle cx="9.5" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
        <path d="M9.2 14h5.6" />
      </svg>
    </div>
  );
}

function HumanSupportAvatar({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-full bg-blue-700 text-white flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      <svg
        className="h-[22px] w-[22px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M4.8 12.6a7.2 7.2 0 0 1 14.4 0"
        />
        <path
          d="M5.2 12.8V15a1.8 1.8 0 0 0 1.8 1.8H8v-4.2H7a1.8 1.8 0 0 0-1.8 1.8Z"
        />
        <path
          d="M18.8 12.8V15a1.8 1.8 0 0 1-1.8 1.8H16v-4.2h1a1.8 1.8 0 0 1 1.8 1.8Z"
        />
        <circle cx="12" cy="9.3" r="2.1" />
        <path d="M9.3 16.3c.8-.9 1.7-1.3 2.7-1.3s1.9.4 2.7 1.3" />
        <path d="M17 16.8h1.4a1 1 0 0 1 1 1v.2a1 1 0 0 1-1 1h-2.4" />
      </svg>
    </div>
  );
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Generate session ID on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chat_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chat_session_id', newSessionId);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Handle open/close - never auto-focus on open
  useEffect(() => {
    if (!isOpen && inputRef.current) {
      inputRef.current.blur();
    }
  }, [isOpen]);

  // Handle keyboard dismissal on mobile when closing
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined') {
      // Try to dismiss keyboard by blurring
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
    }
  }, [isOpen]);

  // Auto-expand textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: currentInput,
          context: {
            page: typeof window !== 'undefined' ? window.location.pathname : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();

      // Handle both success flag and message presence
      if (data.success || data.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || 'Message received',
          timestamp: data.timestamp || new Date().toISOString(),
          suggestedAction: data.suggestedAction,
          intent: data.intent
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again or contact me directly at /contact.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Allow Shift+Enter for new lines (default behavior)
  };

  const quickMessages = [
    { text: 'Do you build AI call agents?', icon: '📞' },
    { text: 'What services do you offer?', icon: '🛠️' },
    { text: 'How does your process work?', icon: '⚙️' },
    { text: 'Book a free ROI Audit', icon: '📅' }
  ];

  const handleRefresh = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleQuickMessage = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: text,
          context: {
            page: typeof window !== 'undefined' ? window.location.pathname : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();

      if (data.success || data.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || 'Message received',
          timestamp: data.timestamp || new Date().toISOString(),
          suggestedAction: data.suggestedAction,
          intent: data.intent
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again or contact me directly at /contact.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chat-dot-bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        .safe-sides {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }

        .input-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }

        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          width: 26px;
          height: 6px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #3B82F6;
          animation: chat-dot-bounce 0.8s ease-in-out infinite;
        }

        .typing-fallback {
          display: none;
          width: 26px;
          text-align: center;
          color: #3B82F6;
          font-size: 12px;
          line-height: 1;
          font-weight: 700;
        }

        /* Mobile keyboard handling */
        @media (max-height: 600px) {
          .messages-mobile {
            max-height: 50vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .typing-dots {
            display: none;
          }

          .typing-fallback {
            display: inline-block;
          }
        }
      `}</style>

      {/* Chat Nudge Tooltip */}
      <ChatNudge isChatOpen={isOpen} />

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 h-14 w-14 rounded-full bg-blue-700 text-white shadow-md flex items-center justify-center ${
          isMobile ? 'bottom-6 right-6 safe-sides' : 'bottom-6 right-6'
        }`}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </>
        )}
      </button>

      {/* Chat Window - Mobile Bottom Sheet / Desktop Floating */}
      {isOpen && (
        <>
          {/* Backdrop only on mobile to avoid desktop GPU cost */}
          {isMobile && (
            <div
              onClick={() => setIsOpen(false)}
              role="presentation"
              className="fixed inset-0 z-40 bg-black/30"
              aria-hidden="true"
            />
          )}

          {/* Chat Container */}
          <div
            ref={chatWindowRef}
            className={`fixed z-50 bg-white dark:bg-gray-900 flex flex-col ${
              isMobile
                ? 'inset-x-0 bottom-0 rounded-t-2xl h-[85vh] max-h-[85vh] w-full'
                : 'bottom-24 right-6 h-[650px] w-[420px] rounded-2xl border border-gray-200 shadow-md dark:border-gray-700'
            }`}
          >
            {/* Grab Handle - Mobile only */}
            {isMobile && (
              <div className="pt-2 pb-1 flex justify-center flex-shrink-0">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Header - Sticky */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 flex-shrink-0 rounded-t-2xl sticky top-0 z-10">
              {/* Top Row: Title and Close */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* AI System Avatar */}
                  <AiSystemAvatar className="h-9 w-9" />

                  {/* Title */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="font-semibold text-base whitespace-nowrap">Jeffery AI</h3>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-2 rounded-lg text-white flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Bottom Row: Status and Refresh */}
              <div className="flex items-center justify-between">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-blue-100 font-medium">Live AI Assistant</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  title="Start new conversation"
                  className="p-2 rounded-lg text-white flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 messages-mobile">
              {messages.length === 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-2">
                    <HumanSupportAvatar className="h-8 w-8 mt-1" />
                    <div className="max-w-[85%] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 p-4 rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.11)]">
                      <p className="font-semibold text-base">
                        Hi — I'm Jeffery's AI assistant.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        Jeffery builds AI voice agents and automation systems that handle calls, qualify leads, and run your ops 24/7. What can I help you with?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pl-10">
                    {quickMessages.map((msg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickMessage(msg.text)}
                        className="p-3 bg-white dark:bg-gray-700 rounded-xl text-left border border-gray-200 dark:border-gray-600"
                      >
                        <div className="text-2xl mb-1">{msg.icon}</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                          {msg.text}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';

                return (
                  <div
                    key={idx}
                    className={`flex ${isAssistant ? 'justify-start items-start gap-2' : 'justify-end'}`}
                  >
                    {isAssistant && <HumanSupportAvatar className="h-8 w-8 mt-1" />}
                  <div
                    className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 shadow-[0_10px_26px_rgba(15,23,42,0.11)]'
                    } p-4 rounded-[20px]`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {/* Suggested Actions */}
                    {msg.suggestedAction &&
                      msg.suggestedAction !== 'none' &&
                      msg.suggestedAction !== 'continue_chat' && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {msg.suggestedAction === 'book_call' && (
                            <a
                              href="/contact"
                              className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                            >
                              <span>→</span>
                              <span>Book a Free ROI Audit</span>
                            </a>
                          )}
                          {msg.suggestedAction === 'view_case_studies' && (
                            <a
                              href="/projects"
                              className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                            >
                              <span>→</span>
                              <span>View Case Studies</span>
                            </a>
                          )}
                          {msg.suggestedAction === 'contact_form' && (
                            <a
                              href="/contact"
                              className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                            >
                              <span>→</span>
                              <span>Send a Message</span>
                            </a>
                          )}
                        </div>
                      )}
                  </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.11)] flex items-center gap-2"
                    role="status"
                    aria-live="polite"
                  >
                    {/* Human Support Avatar */}
                    <HumanSupportAvatar className="h-8 w-8" />

                    <div className="typing-dots" aria-hidden="true">
                      <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                      <span className="typing-dot" style={{ animationDelay: '150ms' }} />
                      <span className="typing-dot" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="typing-fallback" aria-hidden="true">...</span>
                    <span className="sr-only">Assistant is thinking</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Sticky at bottom, keyboard-safe */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex-shrink-0 input-safe">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI voice agents, automation..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 resize-none overflow-hidden"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center flex-shrink-0"
                  title="Send message (or press Enter)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Powered by n8n & OpenAI
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
