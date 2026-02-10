import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Plus,
  ChevronRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GoalsOKR() {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals-okr'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getGoalsAndOKRs', {});
      return response.data;
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goalData) => base44.functions.invoke('updateGoal', goalData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals-okr'] }),
  });

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === 'at-risk') return goal.status === 'at_risk';
    if (activeTab === 'completed') return goal.status === 'completed';
    if (activeTab === 'active') return goal.status === 'active';
    return true;
  });

  const atRiskGoals = goals.filter((g) => g.status === 'at_risk');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Strategist</h1>
              <p className="text-slate-600 mt-1">Set goals, track OKRs, stay on pace</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert - Goals at Risk */}
        {atRiskGoals.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">
                      {atRiskGoals.length} goal{atRiskGoals.length !== 1 ? 's' : ''} at risk
                    </p>
                    <p className="text-sm text-amber-700">
                      You're falling behind pace. Here's how to recover.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="text-amber-600">
                  See Recovery Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="active">
              Active ({goals.filter((g) => g.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="at-risk">
              At Risk ({atRiskGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading goals...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No goals in this view</p>
              <p className="text-slate-500 text-sm mt-1">Create a goal to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="border-slate-200 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-2">{goal.description}</p>
                    </div>
                    {goal.status === 'at_risk' && (
                      <Badge className="bg-amber-100 text-amber-800 ml-2">At Risk</Badge>
                    )}
                    {goal.status === 'completed' && (
                      <Badge className="bg-emerald-100 text-emerald-800 ml-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Target Date</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {goal.targetDate}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Pace</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {goal.expectedProgress}% expected
                      </p>
                    </div>
                  </div>

                  {/* Key Results */}
                  {goal.keyResults?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Key Results</p>
                      <div className="space-y-2">
                        {goal.keyResults.map((kr, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  kr.progress >= 100
                                    ? '#10b981'
                                    : kr.progress >= 75
                                      ? '#3b82f6'
                                      : kr.progress >= 50
                                        ? '#f59e0b'
                                        : '#ef4444',
                              }}
                            ></div>
                            <span className="text-slate-700">{kr.title}</span>
                            <span className="ml-auto text-slate-600">{kr.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insight */}
                  {goal.aiInsight && (
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-xs text-indigo-900 font-medium">💡 AI Insight</p>
                      <p className="text-xs text-indigo-700 mt-1">{goal.aiInsight}</p>
                    </div>
                  )}

                  {/* Next Actions */}
                  {goal.nextActions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Next Actions</p>
                      <ul className="space-y-1">
                        {goal.nextActions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}