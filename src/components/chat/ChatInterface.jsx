import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from './MessageBubble';

export default function ChatInterface({ onTasksUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const newConversation = await base44.agents.createConversation({
      agent_name: "day_planner",
      metadata: { name: "Today's Session" }
    });
    setConversation(newConversation);
    
    const unsubscribe = base44.agents.subscribeToConversation(newConversation.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(data.messages?.some(m => m.role === 'assistant' && !m.content && m.tool_calls?.some(tc => tc.status === 'running')));
      
      if (data.messages?.some(m => m.tool_calls?.some(tc => tc.status === 'completed'))) {
        onTasksUpdate?.();
      }
    });

    return () => unsubscribe();
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: userMessage
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What should I focus on today?",
    "Add a task for tomorrow",
    "Show my high priority tasks",
    "Help me plan my afternoon"
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50/50 to-white rounded-3xl border border-slate-200/60">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-slate-100">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">AI Assistant</h3>
          <p className="text-xs text-slate-500">Here to help organize your day</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-indigo-500" />
            </div>
            <h4 className="font-medium text-slate-700 mb-2">How can I help you today?</h4>
            <p className="text-sm text-slate-500 mb-6">
              I can help you manage tasks, plan your day, and stay organized.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isLoading && messages.length > 0 && !messages[messages.length - 1]?.tool_calls?.some(tc => tc.status === 'running') && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="flex-1 border-slate-200 focus-visible:ring-indigo-500/20"
            disabled={isLoading || !conversation}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !conversation}
            className="bg-indigo-600 hover:bg-indigo-700 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}