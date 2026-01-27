import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, RefreshCw, DollarSign, PiggyBank, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function AIInsights({ transactions, budgets }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    // Prepare financial summary for AI
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const categorySpending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + (t.amount || 0);
    });

    const budgetStatus = budgets.map(b => {
      const spent = categorySpending[b.category] || 0;
      const percentage = Math.round((spent / b.monthly_limit) * 100);
      return { category: b.category, limit: b.monthly_limit, spent, percentage };
    });

    const prompt = `You are TAMAI, a calm and supportive financial assistant. Analyze this user's financial data and provide gentle, encouraging insights. Never use shame or guilt language.

Monthly Financial Summary:
- Total Income: $${totalIncome}
- Total Expenses: $${totalExpenses}
- Balance: $${totalIncome - totalExpenses}

Spending by Category:
${Object.entries(categorySpending).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

Budget Status:
${budgetStatus.length > 0 ? budgetStatus.map(b => `- ${b.category}: $${b.spent}/$${b.limit} (${b.percentage}%)`).join('\n') : 'No budgets set'}

Provide exactly 3 insights:
1. A reassuring overall assessment (how they're doing)
2. One specific observation about their spending (no judgment)
3. One gentle suggestion for improvement

Keep each insight to 1-2 sentences. Be warm and supportive. Frame money in terms of freedom and peace of mind, not restriction.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_status: {
              type: "object",
              properties: {
                message: { type: "string" },
                sentiment: { type: "string", enum: ["positive", "neutral", "needs_attention"] }
              }
            },
            observation: {
              type: "object",
              properties: {
                message: { type: "string" },
                category: { type: "string" }
              }
            },
            suggestion: {
              type: "object",
              properties: {
                message: { type: "string" },
                potential_savings: { type: "number" }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (err) {
      setError("Couldn't generate insights right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      generateInsights();
    }
  }, []);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'needs_attention': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <DollarSign className="h-5 w-5 text-slate-500" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 border-emerald-200';
      case 'needs_attention': return 'bg-amber-50 border-amber-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
        <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-slate-600 font-medium">Add some transactions</p>
        <p className="text-sm text-slate-400">AI insights will appear once you have financial data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-800">AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateInsights}
          disabled={loading}
          className="text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Analyzing your finances...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-3">
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 border ${getSentimentColor(insights.overall_status?.sentiment)}`}
          >
            <div className="flex items-start gap-3">
              {getSentimentIcon(insights.overall_status?.sentiment)}
              <div>
                <p className="text-sm font-medium text-slate-700">How you're doing</p>
                <p className="text-slate-600 mt-1">{insights.overall_status?.message}</p>
              </div>
            </div>
          </motion.div>

          {/* Observation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {insights.observation?.category && `About ${insights.observation.category}`}
                </p>
                <p className="text-slate-600 mt-1">{insights.observation?.message}</p>
              </div>
            </div>
          </motion.div>

          {/* Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-700">Gentle suggestion</p>
                <p className="text-slate-600 mt-1">{insights.suggestion?.message}</p>
                {insights.suggestion?.potential_savings > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                    <PiggyBank className="h-4 w-4" />
                    <span>Could free up ~${insights.suggestion.potential_savings}/month</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}