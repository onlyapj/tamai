import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

export default function PortfolioChart({ investments, currencySymbol }) {
  // Prepare data for pie chart (by type)
  const typeData = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.name === inv.type);
    if (existing) {
      existing.value += inv.current_value;
    } else {
      acc.push({
        name: inv.type.replace('_', ' '),
        value: inv.current_value
      });
    }
    return acc;
  }, []);

  // Prepare data for performance bar chart
  const performanceData = investments.map(inv => ({
    name: inv.ticker || inv.name.substring(0, 10),
    gain: inv.current_value - inv.cost_basis,
    percent: inv.cost_basis > 0 ? ((inv.current_value - inv.cost_basis) / inv.cost_basis * 100) : 0
  })).sort((a, b) => b.percent - a.percent);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-800 mb-6">Portfolio Insights</h3>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Allocation Pie Chart */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-4">Asset Allocation</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {typeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600 capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Bar Chart */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-4">Individual Performance</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'percent' ? `${value.toFixed(2)}%` : `${currencySymbol}${value.toLocaleString()}`,
                  name === 'percent' ? 'Return' : 'Gain/Loss'
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar 
                dataKey="percent" 
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}