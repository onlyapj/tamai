import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Zap, Loader2 } from 'lucide-react';
import TrendAnalysisChart from './TrendAnalysisChart';
import CorrelationMatrix from './CorrelationMatrix';
import PatternInsights from './PatternInsights';

export default function HabitAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('quarterly');
  const [activeTab, setActiveTab] = useState('trends');
  const queryClient = useQueryClient();

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list()
  });

  const { data: trendData, isLoading: trendsLoading } = useQuery({
    queryKey: ['habit-trends', timeframe],
    queryFn: () => base44.functions.invoke('analyzeHabitTrends', { timeframe }),
    enabled: activeTab === 'trends'
  });

  const { data: correlationData, isLoading: correlationLoading } = useQuery({
    queryKey: ['habit-correlations'],
    queryFn: () => base44.functions.invoke('analyzeHabitCorrelations', {}),
    enabled: activeTab === 'correlations'
  });

  const { data: patternData, isLoading: patternsLoading } = useQuery({
    queryKey: ['habit-patterns'],
    queryFn: () => base44.functions.invoke('analyzeHabitPatterns', {}),
    enabled: activeTab === 'patterns'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Habit Analytics</h1>
          <p className="text-slate-600 mt-1">Discover patterns and optimize your habit formation</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Correlations
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <div className="mt-6">
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['weekly', 'monthly', 'quarterly', 'yearly'].map(tf => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? 'default' : 'outline'}
                    onClick={() => setTimeframe(tf)}
                    disabled={trendsLoading}
                    className="capitalize"
                  >
                    {tf}
                  </Button>
                ))}
              </div>

              {trendsLoading ? (
                <Card>
                  <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </CardContent>
                </Card>
              ) : (
                <TrendAnalysisChart data={trendData?.trends} timeframe={timeframe} />
              )}
            </div>
          )}

          {/* Correlations Tab */}
          {activeTab === 'correlations' && (
            correlationLoading ? (
              <Card>
                <CardContent className="py-12 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </CardContent>
              </Card>
            ) : (
              <CorrelationMatrix data={correlationData} />
            )
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            patternsLoading ? (
              <Card>
                <CardContent className="py-12 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </CardContent>
              </Card>
            ) : (
              <PatternInsights data={patternData} />
            )
          )}
        </div>
      </Tabs>
    </div>
  );
}