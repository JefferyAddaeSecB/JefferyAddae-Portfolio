import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, RefreshCw, Download, Copy, Check, Paperclip, Image, FileText, Zap, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; url: string; type: string }[];
}

const SUGGESTED_QUESTIONS = [
  "What are Jeffery's core technical skills?",
  "Tell me about his recent projects",
  "What services does he offer?",
  "How can I hire him for a project?",
  "What's his experience with React and Next.js?",
  "Can he build a SaaS application?"
];

export function AIPortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Jeffery's AI assistant. I can answer questions about his skills, projects, experience, and availability. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const chatEndpoint = `${apiBaseUrl}/api/chat`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedSession = window.localStorage.getItem('chat_session_id');
    if (storedSession) {
      setSessionId(storedSession);
      return;
    }
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    window.localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    const outboundMessage = userMessage || (attachments.length ? 'Sent attachments' : '');
    if (!outboundMessage || loading) return;

    setInput('');
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage || 'Sent attachments',
      timestamp: new Date(),
      attachments: attachments.map(f => ({ name: f.name, url: URL.createObjectURL(f), type: f.type }))
    };

    setAttachments([]);

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          message: outboundMessage,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          context: typeof window !== 'undefined'
            ? {
                page: window.location.pathname,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                attachments: attachments.map((file) => ({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                })),
              }
            : {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const nextSessionId = data.sessionId || data.conversationId || data.session_id || sessionId || Date.now().toString();
      if (nextSessionId) {
        setSessionId(nextSessionId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('chat_session_id', nextSessionId);
        }
      }
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || data.reply || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact Jeffery directly through the contact page.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "👋 Hi! I'm Jeffery's AI assistant. I can answer questions about his skills, projects, experience, and availability. What would you like to know?",
        timestamp: new Date()
      }
    ]);
    setSessionId(null);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    const chatText = messages
      .map(msg => `[${msg.role.toUpperCase()}] ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeffery-portfolio-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-5 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 z-50 group backdrop-blur-sm border border-white/10"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Bot className="w-7 h-7" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-white/10 backdrop-blur-sm flex items-center gap-2">
              <MessageCircle className="w-3 h-3" />
              Chat with Jeffery's AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-120px)] bg-card/95 backdrop-blur-xl border border-blue-500/20 rounded-3xl shadow-2xl shadow-blue-500/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white p-5 flex items-center justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    Jeffery AI
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium border border-white/30">BETA</span>
                  </h3>
                  <p className="text-xs opacity-90 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online & Ready
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10"
                  title="Export chat"
                  aria-label="Export chat"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/10"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
                        : 'bg-white/80 dark:bg-gray-800/80 text-foreground border border-blue-500/20 rounded-bl-md shadow-lg backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                            {att.type.startsWith('image/') ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            <span className="truncate flex-1">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className={`text-xs ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800/80 dark:to-gray-700/80 border border-blue-500/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 backdrop-blur-sm shadow-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 py-3 border-t border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <p className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Quick starts</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs px-3 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white border border-blue-500/20 hover:border-transparent rounded-xl transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm font-medium"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="border-t border-blue-500/20 p-4 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm">
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 border border-blue-500/20 rounded-xl text-xs backdrop-blur-sm">
                      {file.type.startsWith('image/') ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border border-blue-500/20 rounded-2xl bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all backdrop-blur-sm"
                  title="Attach files"
                  disabled={loading}
                >
                  <Paperclip className="w-5 h-5 text-blue-600" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Jeffery's work..."
                  className="flex-1 px-4 py-3 border border-blue-500/20 rounded-2xl bg-white/80 dark:bg-gray-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm shadow-sm placeholder:text-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && attachments.length === 0)}
                  className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md disabled:shadow-none hover:scale-105 active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Zap className="w-3 h-3 text-blue-600" />
                <p className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-medium">
                  Powered by AI • Press Enter to send
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
