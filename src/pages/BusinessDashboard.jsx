import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Target,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Brain,
} from 'lucide-react';
import { format } from 'date-fns';

export default function BusinessDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['business-dashboard'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getBusinessDashboard', {});
      return response.data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Here's what your business needs today.
              </h1>
              <p className="text-slate-600 mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-2">
              {['week', 'month', 'quarter'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Cash Balance</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    ${dashboardData?.cashBalance || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    ${dashboardData?.revenue || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Tasks</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {dashboardData?.activeTasks || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Team Members</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {dashboardData?.teamMembers || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Alerts & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Priorities */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Top Priorities Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData?.topPriorities?.length > 0 ? (
                  dashboardData.topPriorities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No high-priority items right now.</p>
                )}
              </CardContent>
            </Card>

            {/* Overdue Tasks */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.overdueTasks?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.overdueTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <p className="font-medium text-red-900 text-sm">{task.title}</p>
                        <p className="text-xs text-red-700 mt-1">
                          Assigned to {task.owner} • {task.daysOverdue} days overdue
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">All tasks on track!</p>
                )}
              </CardContent>
            </Card>

            {/* Goals at Risk */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Goals at Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.goalsAtRisk?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.goalsAtRisk.map((goal, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 text-sm">{goal.title}</p>
                          <span className="text-xs font-semibold text-amber-700">
                            {goal.completion}% complete
                          </span>
                        </div>
                        <p className="text-xs text-amber-700 mt-2">{goal.insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">All goals tracking well!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Insights */}
          <div>
            <Card className="border-slate-200 shadow-sm sticky top-28">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.aiInsights?.length > 0 ? (
                  dashboardData.aiInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg border border-violet-200"
                    >
                      <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                      <p className="text-xs text-slate-600 mt-2">{insight.message}</p>
                      {insight.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full text-indigo-600 hover:text-indigo-700"
                        >
                          {insight.action}
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Loading insights...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}