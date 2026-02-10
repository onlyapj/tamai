import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { subDays, subMonths, format } from 'date-fns';
import TaskCompletionChart from '../components/analytics/TaskCompletionChart';
import MoodTrendChart from '../components/analytics/MoodTrendChart';
import BudgetAdherenceChart from '../components/analytics/BudgetAdherenceChart';
import ActivityLevelChart from '../components/analytics/ActivityLevelChart';
import InsightsPanel from '../components/analytics/InsightsPanel';
import FinanceOverviewChart from '../components/analytics/FinanceOverviewChart';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  const getDateRange = () => {
    const end = new Date();
    const start = dateRange === '7days' ? subDays(end, 7) :
                  dateRange === '30days' ? subDays(end, 30) :
                  dateRange === '90days' ? subDays(end, 90) :
                  subMonths(end, 6);
    return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
  };

  const { start, end } = getDateRange();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: () => base44.entities.Task.list('-created_date', 500)
  });

  const { data: moods = [] } = useQuery({
    queryKey: ['moods-analytics'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 500)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-analytics'],
    queryFn: () => base44.entities.Transaction.list('-date', 500)
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets-analytics'],
    queryFn: () => base44.entities.Budget.list('-month', 100)
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['health-analytics'],
    queryFn: () => base44.entities.HealthLog.list('-date', 500)
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
              <p className="text-slate-600">Track your progress and insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Insights Panel */}
        <InsightsPanel 
          tasks={tasks}
          moods={moods}
          transactions={transactions}
          budgets={budgets}
          healthLogs={healthLogs}
          dateRange={{ start, end }}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <TaskCompletionChart tasks={tasks} dateRange={{ start, end }} />
              <MoodTrendChart moods={moods} dateRange={{ start, end }} />
              <BudgetAdherenceChart 
                transactions={transactions}
                budgets={budgets}
                dateRange={{ start, end }}
              />
              <ActivityLevelChart healthLogs={healthLogs} dateRange={{ start, end }} />
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="mt-6">
            <TaskCompletionChart tasks={tasks} dateRange={{ start, end }} detailed />
          </TabsContent>

          <TabsContent value="mindfulness" className="mt-6">
            <MoodTrendChart moods={moods} dateRange={{ start, end }} detailed />
          </TabsContent>

          <TabsContent value="finance" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <BudgetAdherenceChart 
                transactions={transactions}
                budgets={budgets}
                dateRange={{ start, end }}
                detailed
              />
              <FinanceOverviewChart 
                transactions={transactions}
                dateRange={{ start, end }}
              />
            </div>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <ActivityLevelChart healthLogs={healthLogs} dateRange={{ start, end }} detailed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}