import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrendAnalysisChart({ data, timeframe }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          No data available for this period
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    period: item.period,
    ...item.habits.reduce((acc, h) => ({
      ...acc,
      [h.name]: h.completion_rate
    }), {})
  }));

  const habitNames = data[0]?.habits?.map(h => h.name) || [];
  const colors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                {habitNames.map((name, idx) => (
                  <linearGradient key={name} id={`color${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              {habitNames.slice(0, 3).map((name, idx) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[idx]}
                  fillOpacity={0.1}
                  fill={colors[idx]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {habitNames.map((name, idx) => {
              const rates = data.map(d => d.habits.find(h => h.name === name)?.completion_rate || 0);
              const avg = (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1);
              const max = Math.max(...rates);
              const min = Math.min(...rates);
              return (
                <div key={name} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 truncate font-medium">{name}</p>
                  <p className="text-lg font-bold text-slate-900">{avg}%</p>
                  <p className="text-xs text-slate-500 mt-1">Avg rate</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}