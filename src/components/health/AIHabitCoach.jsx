import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIHabitCoach() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: coaching, isLoading, error, refetch } = useQuery({
    queryKey: ['habitCoach'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiHabitCoach', {});
      return response.data;
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <Sparkles className="h-5 w-5" />
            AI Habit Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !coaching) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <Sparkles className="h-5 w-5" />
            AI Habit Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">{coaching?.message || 'Create your first habit to get personalized coaching!'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <Sparkles className="h-5 w-5" />
            Your AI Coach
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-violet-600 hover:bg-violet-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Encouragement Section */}
        {coaching.encouragement && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-xl border border-violet-200 shadow-sm"
          >
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 italic font-medium">{coaching.encouragement}</p>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        {coaching.stats && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-white rounded-xl border border-violet-200"
            >
              <p className="text-2xl font-bold text-violet-600">{coaching.stats.totalHabits}</p>
              <p className="text-xs text-slate-600">Active Habits</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-white rounded-xl border border-violet-200"
            >
              <p className="text-2xl font-bold text-emerald-600">{coaching.stats.improvingCount}</p>
              <p className="text-xs text-slate-600">Improving</p>
            </motion.div>
          </div>
        )}

        {/* Tips Section */}
        {coaching.tips && coaching.tips.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Personalized Tips
            </h3>
            <div className="space-y-2">
              {coaching.tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-slate-900 text-sm">{tip.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{tip.description}</p>
                  {tip.relatedHabit && (
                    <p className="text-xs text-violet-600 mt-2">💡 Related: {tip.relatedHabit}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Nudges Section */}
        {coaching.nudges && coaching.nudges.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-violet-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Gentle Nudges
            </h3>
            <div className="space-y-2">
              {coaching.nudges.map((nudge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <p className="font-medium text-slate-900 text-sm">
                    📌 {nudge.habit}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{nudge.message}</p>
                  <p className="text-xs text-slate-600 mt-2 italic">{nudge.reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* No content state */}
        {(!coaching.tips || coaching.tips.length === 0) && (!coaching.nudges || coaching.nudges.length === 0) && (
          <p className="text-center text-slate-600 py-4">
            Keep logging your habits to unlock personalized coaching insights!
          </p>
        )}
      </CardContent>
    </Card>
  );
}