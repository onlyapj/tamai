import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  PieChart,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinanceCFO() {
  const [timeframe, setTimeframe] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: financials, isLoading } = useQuery({
    queryKey: ['financial-data', timeframe],
    queryFn: async () => {
      const response = await base44.functions.invoke('getFinancialData', { timeframe });
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI CFO</h1>
              <p className="text-slate-600 mt-1">Smart financial tracking and forecasting</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map((t) => (
              <Button
                key={t}
                variant={timeframe === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${financials?.totalRevenue || '0'}
              </p>
              <p className="text-xs text-emerald-600 mt-2">↑ 12% vs last period</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${financials?.totalExpenses || '0'}
              </p>
              <p className="text-xs text-red-600 mt-2">↑ 8% vs last period</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Net Income</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${financials?.netIncome || '0'}
              </p>
              <p className="text-xs text-emerald-600 mt-2">Healthy margin</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Runway</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {financials?.runway || '∞'}
              </p>
              <p className="text-xs text-slate-600 mt-2">At current burn rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue vs Expenses */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financials?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financials?.expenses?.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {exp.category}
                    </span>
                    <span className="text-sm text-slate-600">{exp.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${exp.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Anomalies */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Unusual Spending Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financials?.anomalies?.length > 0 ? (
                financials.anomalies.map((anomaly, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                    <p className="font-medium text-slate-900 text-sm">{anomaly.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{anomaly.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-red-600">
                      Investigate
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-red-900 text-sm">No anomalies detected. Spending looks normal.</p>
              )}
            </CardContent>
          </Card>

          {/* Cost Cutting Opportunities */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <TrendingDown className="h-5 w-5" />
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financials?.costSavings?.length > 0 ? (
                financials.costSavings.map((saving, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="font-medium text-slate-900 text-sm">{saving.title}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Potential savings: <span className="font-bold">${saving.amount}</span>
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-amber-600">
                      Learn More
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-amber-900 text-sm">No cost-cutting opportunities found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {financials?.recentTransactions?.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{tx.description}</p>
                    <p className="text-sm text-slate-600">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount}
                    </p>
                    <p className="text-xs text-slate-600">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}