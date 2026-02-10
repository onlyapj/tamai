import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HabitInsightsPanel({ habitId }) {
  const [showInsights, setShowInsights] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['habit-insights', habitId],
    queryFn: () => base44.functions.invoke('generateHabitInsights', { habit_id: habitId }),
    enabled: showInsights
  });

  const stats = data?.stats;
  const insights = data?.insights;

  return (
    <div className="space-y-4">
      {!showInsights ? (
        <Button
          onClick={() => setShowInsights(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Get AI Insights
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {isLoading ? (
            <Card>
              <CardContent className="py-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </CardContent>
            </Card>
          ) : insights ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Completion</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Award className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Current Streak</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.currentStreak}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Zap className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Best Streak</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.bestStreak}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-5 w-5 text-rose-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Trend</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">{stats.trend}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">✨ What's Working</h4>
                    <p className="text-slate-600 text-sm">{insights.strengths}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">🎯 Area to Improve</h4>
                    <p className="text-slate-600 text-sm">{insights.improvement_area}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">💡 Recommendation</h4>
                    <p className="text-slate-600 text-sm">{insights.recommendation}</p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-900 italic">"{insights.motivation}"</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                onClick={() => refetch()}
                className="w-full"
              >
                Refresh Insights
              </Button>
            </>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}