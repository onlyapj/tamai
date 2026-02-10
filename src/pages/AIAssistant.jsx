import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Loader2,
  Brain,
  TrendingUp,
  AlertCircle,
  Target,
  Users,
  BarChart3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        'Hi there! 👋 I\'m your AI Business Assistant. Ask me anything about your finances, tasks, goals, or team. Here are some things I can help with:',
      suggestions: [
        'Why is cash low this month?',
        'What should I focus on today?',
        'Create tasks for this goal',
        'Summarize team performance',
        'What expenses can I cut?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('aiAssistantQuery', {
        query,
        userId: user?.email,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const newMessage = {
        id: messages.length + 1,
        role: 'assistant',
        content: data.response,
        actions: data.actions,
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 1,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      setIsLoading(false);
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    sendMessageMutation.mutate(input);
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">AI Assistant</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Ask me about your business. I have access to all your data.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-lg px-4 py-3'
                    : 'w-full'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* Action Buttons */}
                    {message.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {message.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestion(suggestion)}
                            className="text-left p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {suggestion}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about your business..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            I can help with: finances, tasks, goals, team insights, and more.
          </p>
        </div>
      </div>
    </div>
  );
}