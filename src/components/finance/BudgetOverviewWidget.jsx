import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function BudgetOverviewWidget({ budgets, transactions, currencySymbol = '$' }) {
  // Calculate spending per category
  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'other';
      acc[cat] = (acc[cat] || 0) + (t.amount || 0);
      return acc;
    }, {});

  // Get budget status
  const budgetStats = budgets.map(budget => {
    const spent = spendingByCategory[budget.category] || 0;
    const percentage = (spent / budget.monthly_limit) * 100;
    return {
      ...budget,
      spent,
      percentage,
      isOver: spent > budget.monthly_limit,
      isNear: percentage >= 80 && spent <= budget.monthly_limit
    };
  });

  const overBudget = budgetStats.filter(b => b.isOver);
  const nearBudget = budgetStats.filter(b => b.isNear);
  const onTrack = budgetStats.filter(b => !b.isOver && !b.isNear);

  if (budgets.length === 0) return null;

  return (
    <Link to={createPageUrl('Finance')}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Budget Status</h3>
          <div className="text-xs text-slate-500">{budgets.length} budgets</div>
        </div>

        <div className="space-y-2">
          {overBudget.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">{overBudget.length} over budget</p>
                <p className="text-xs text-red-600 truncate">
                  {overBudget.map(b => b.category).join(', ')}
                </p>
              </div>
            </div>
          )}

          {nearBudget.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
              <TrendingDown className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-700">{nearBudget.length} near limit</p>
                <p className="text-xs text-amber-600 truncate">
                  {nearBudget.map(b => b.category).join(', ')}
                </p>
              </div>
            </div>
          )}

          {onTrack.length > 0 && overBudget.length === 0 && nearBudget.length === 0 && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-700">All budgets on track</p>
                <p className="text-xs text-emerald-600">Great spending discipline! 🎉</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">Tap to view details →</p>
        </div>
      </motion.div>
    </Link>
  );
}