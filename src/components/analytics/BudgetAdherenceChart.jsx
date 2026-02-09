import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';

export default function BudgetAdherenceChart({ transactions, budgets, dateRange, detailed = false }) {
  const { start, end } = dateRange;
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  
  const chartData = monthBudgets.map(budget => {
    const spent = transactions
      .filter(t => 
        t.category === budget.category && 
        t.type === 'expense' &&
        t.date >= currentMonth + '-01'
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget.monthly_limit > 0 
      ? Math.round((spent / budget.monthly_limit) * 100)
      : 0;

    return {
      category: budget.category.charAt(0).toUpperCase() + budget.category.slice(1),
      spent: Math.round(spent),
      budget: budget.monthly_limit,
      remaining: Math.max(0, budget.monthly_limit - spent),
      percentage
    };
  });

  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = chartData.reduce((sum, d) => sum + d.spent, 0);
  const adherenceRate = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Budget Adherence</h3>
          <p className="text-sm text-slate-500">This month's spending</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{adherenceRate}%</p>
          <p className="text-xs text-slate-500">Under Budget</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">${totalSpent}</p>
          <p className="text-xs text-slate-500">Spent</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-600">${totalBudget}</p>
          <p className="text-xs text-slate-500">Budget</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={detailed ? 400 : 250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="spent" fill="#ef4444" name="Spent" />
          <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}