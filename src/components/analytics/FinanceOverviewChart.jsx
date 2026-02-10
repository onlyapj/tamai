import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingDown, DollarSign } from 'lucide-react';

const COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#eab308', '#ec4899', '#f43f5e', '#6366f1', '#10b981', '#94a3b8'];

export default function FinanceOverviewChart({ transactions, dateRange }) {
  const { start, end } = dateRange;
  
  // Filter transactions by date range
  const filtered = transactions.filter(t => 
    t.date >= start && 
    t.date <= end && 
    t.type === 'expense'
  );

  // Group by sub-category or category
  const grouped = filtered.reduce((acc, t) => {
    const key = t.sub_category || t.category;
    if (!acc[key]) acc[key] = 0;
    acc[key] += t.amount;
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value: Math.round(value) 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 9);

  const totalSpent = chartData.reduce((sum, d) => sum + d.value, 0);
  const topSpending = chartData[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Spending Breakdown</h3>
          <p className="text-sm text-slate-500">By sub-category</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No spending data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">${totalSpent.toLocaleString()}</p>
            </div>
            {topSpending && (
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-medium">Top Category</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{topSpending.name}</p>
                <p className="text-xs text-slate-500">${topSpending.value.toLocaleString()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}