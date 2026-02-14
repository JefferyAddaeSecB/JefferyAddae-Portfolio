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
    { text: 'What services do you offer?', icon: '🛠️' },
    { text: 'Tell me about your experience', icon: '📊' },
    { text: 'How does your process work?', icon: '⚙️' },
    { text: 'I want to book a call', icon: '📅' }
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
        .safe-sides {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }

        .input-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }

        /* Mobile keyboard handling */
        @media (max-height: 600px) {
          .messages-mobile {
            max-height: 50vh;
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
                  {/* Bot Avatar */}
                  <div className="text-2xl font-bold flex-shrink-0">🤖</div>

                  {/* Title and Beta Badge */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="font-semibold text-base whitespace-nowrap">Jeffery AI</h3>
                    <span className="px-2 py-0.5 bg-white/30 text-white text-[10px] font-medium rounded-full flex-shrink-0">
                      BETA
                    </span>
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
                  <span className="text-sm text-blue-100 font-medium">Online & Ready</span>
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

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                    } p-4 rounded-2xl shadow-sm`}
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
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-2xl shadow-sm flex items-center gap-2">
                    {/* Agent Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>

                    {/* Static processing indicator */}
                    <div className="text-sm text-gray-600 dark:text-gray-300">Thinking...</div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="sr-only" aria-live="polite">
                  Assistant is thinking
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
                  placeholder="Ask about Jeffery & AI automation..."
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
