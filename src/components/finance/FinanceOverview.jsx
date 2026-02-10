import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const categoryColors = {
  housing: '#3b82f6',
  transport: '#a855f7',
  food: '#f97316',
  utilities: '#eab308',
  entertainment: '#ec4899',
  health: '#f43f5e',
  shopping: '#6366f1',
  savings: '#10b981',
  income: '#22c55e',
  investment: '#14b8a6',
  other: '#64748b'
};

export default function FinanceOverview({ transactions, currencySymbol = '$' }) {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Group by category
  const byCategory = expenses.reduce((acc, t) => {
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + (t.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, color: categoryColors[name] || categoryColors.other }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Spending by Category - Pie Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Spending by Category</h3>
        
        {pieData.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-2">
              {pieData.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 capitalize truncate">{cat.name.replace('_', ' ')}</p>
                    <p className="text-sm font-semibold text-slate-800">{currencySymbol}{cat.value.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">No expenses this month</p>
        )}
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Top Categories</h3>
        <div className="space-y-3">
          {pieData.slice(0, 5).map((cat, i) => {
            const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 capitalize">{cat.name.replace('_', ' ')}</span>
                  <span className="font-medium text-slate-800">{currencySymbol}{cat.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}