'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Download, Sparkles, ChefHat, FlaskConical, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';

type Personality = 'friendly' | 'gordon' | 'grandma' | 'scientific';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersonalityConfig {
  name: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
  greeting: string;
}

const personalities: Record<Personality, PersonalityConfig> = {
  friendly: {
    name: 'Friendly Chef',
    emoji: '👨‍🍳',
    icon: <ChefHat className="w-5 h-5" />,
    description: 'Encouraging and helpful',
    greeting: 'Hello! 👋 I\'m your friendly cooking assistant! I\'m here to help you create amazing dishes with confidence. What would you like to cook today?',
  },
  gordon: {
    name: 'Gordon Ramsay Mode',
    emoji: '🔥',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Direct and passionate',
    greeting: 'Right, let\'s get this sorted! 🔥 I\'m here to help you cook properly. No nonsense, just great food. What are we making?',
  },
  scientific: {
    name: 'Science Cook',
    emoji: '🔬',
    icon: <FlaskConical className="w-5 h-5" />,
    description: 'Explains the science',
    greeting: 'Hello! 🔬 I\'m your science-based cooking assistant. I\'ll explain the chemistry and physics behind cooking techniques. What would you like to understand?',
  },
  grandma: {
    name: 'Grandma Style',
    emoji: '❤️',
    icon: <Heart className="w-5 h-5" />,
    description: 'Warm and traditional',
    greeting: 'Hello, dear! ❤️ I\'m here to share my favorite recipes and cooking secrets passed down through generations. What would you like to learn?',
  },
};

const quickPrompts = [
  "What can I make with chicken and rice?",
  "How do I fix oversalted soup?",
  "Beginner-friendly dinner ideas",
  "Convert this recipe to metric",
  "Make this recipe vegetarian",
];

// robust key generator (avoids "" / duplicates)
function msgKey(m: Message, i: number) {
    // Prefer a non-empty id
    if (m.id?.trim()) return m.id;
  
    // Fallback if id is missing or empty (rare)
    return `${m.role}-${m.timestamp.toISOString()}-${i}`;
  }

async function sendToChatAPI(args: {
  message: string;
  personality: Personality;
  history: Message[];
}) {
  // Send only role/content to the API (avoid Date serialization issues)
  const historyMin = args.history.map(m => ({ role: m.role, content: m.content }));
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: args.message,
      personality: args.personality,
      history: historyMin,
    }),
  });

  if (!res.ok) {
    // fallback to generic message if network error (server already has its own mock fallback)
    return { response: "I'm having trouble connecting right now. Try again in a moment?", mock: true };
  }
  return res.json() as Promise<{ response: string; success?: boolean; mock?: boolean }>;
}


function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function exportChatAsRecipe(messages: Message[]): string {
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const userMessages = messages.filter(m => m.role === 'user');
  
  let recipe = '# Recipe from Chat\n\n';
  recipe += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  if (userMessages.length > 0) {
    recipe += '## Request\n';
    recipe += userMessages.map(m => m.content).join('\n') + '\n\n';
  }
  
  recipe += '## Instructions\n';
  assistantMessages.forEach((msg, idx) => {
    recipe += `\n### Step ${idx + 1}\n`;
    recipe += msg.content + '\n';
  });
  
  return recipe;
}
  
export default function ChatPage() {
  const [personality, setPersonality] = useState<Personality>('friendly');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: personalities.friendly.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Update greeting when personality changes
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: personalities[personality].greeting,
        timestamp: new Date(),
      }]);
    }
  }, [personality]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
  
    // 1) add user message
    const userMsg: Message = {
      id: nanoid(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
  
    try {
      // 2) call API with full history including the new userMsg
      const { response } = await sendToChatAPI({
        message: userMsg.content,
        personality,
        history: [...messages, userMsg],
      });
  
      // 3) add assistant message
      const aiMsg: Message = {
        id: nanoid(),
        role: 'assistant',
        content: response ?? "Sorry — I couldn't generate a reply.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const failMsg: Message = {
        id: nanoid(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, failMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: personalities[personality].greeting,
        timestamp: new Date(),
      }]);
    }
  };

  const handleExportRecipe = () => {
    const recipe = exportChatAsRecipe(messages);
    const blob = new Blob([recipe], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const currentPersonality = personalities[personality];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                AI Cooking Assistant {currentPersonality.emoji}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {currentPersonality.name} - {currentPersonality.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportRecipe}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Export as recipe"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Personality Selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(personalities) as Personality[]).map((p) => {
              const config = personalities[p];
              return (
                <button
                  key={p}
                  onClick={() => setPersonality(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    personality === p
                      ? 'bg-green-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  <span>{config.emoji}</span>
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick starters:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-zinc-700 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container - WhatsApp Style */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800">
          <AnimatePresence initial={false}>
            {messages.map((message, idx) => {
              const isUser = message.role === 'user';
              const showAvatar = idx === 0 || messages[idx - 1].role !== message.role;

              return (
                <motion.div
                  key={msgKey(message, idx)} // ← unique, non-empty, stable
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-2 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'w-8 h-8' : 'w-8'} flex items-center justify-center`}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                          {currentPersonality.emoji}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isUser
                          ? 'bg-green-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-zinc-600'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {isUser && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'w-8 h-8' : 'w-8'} flex items-center justify-center`}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                </motion.div>
                );
              })}
            
            {isTyping && (
              <motion.div
                key="typing-indicator" // ← give it a key, or move outside AnimatePresence
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex gap-2 items-end justify-start animate-in fade-in"
              >
                <div className="flex gap-2 items-end justify-start animate-in fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                    {currentPersonality.emoji}
                    </div>
                    <div className="bg-white dark:bg-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-zinc-600">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* Input Area - WhatsApp Style */}
          <div className="border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] shadow-md hover:shadow-lg disabled:shadow-none"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
