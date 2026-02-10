import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Lightbulb, Zap, Heart, TrendingUp, RefreshCw, Award, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoachingDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState('focus');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const queryClient = useQueryClient();

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

  const createHabitMutation = useMutation({
    mutationFn: (name) => base44.entities.Habit.create({
      name,
      category: 'health',
      frequency: 'daily',
      target_count: 1,
      active: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitCoach'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowHabitForm(false);
      setHabitName('');
    },
    onError: (error) => {
      console.error('Failed to create habit:', error);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !coaching?.success) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardContent className="pt-6">
          <p className="text-slate-600 text-center py-4">{coaching?.message || error?.message || 'Create habits to unlock personalized coaching!'}</p>
          
          {!showHabitForm ? (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setShowHabitForm(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              <input
                type="text"
                placeholder="e.g., Morning meditation, 30-min workout..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createHabitMutation.mutate(habitName)}
                  disabled={!habitName.trim() || createHabitMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {createHabitMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setShowHabitForm(false);
                    setHabitName('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      id: 'focus',
      icon: Target,
      title: 'Weekly Focus',
      color: 'violet',
      content: coaching.focusArea
    },
    {
      id: 'goal',
      icon: Award,
      title: 'This Week\'s Goal',
      color: 'emerald',
      content: coaching.weeklyGoal
    },
    {
      id: 'story',
      icon: Heart,
      title: 'Your Progress',
      color: 'rose',
      content: coaching.successStory
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-lg"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold opacity-90">Coach Says</p>
              <p className="text-lg font-bold mt-1">{coaching.encouragement}</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const colorMap = {
            violet: 'from-violet-50 to-purple-50 border-violet-200',
            emerald: 'from-emerald-50 to-green-50 border-emerald-200',
            rose: 'from-rose-50 to-pink-50 border-rose-200'
          };
          const iconColorMap = {
            violet: 'text-violet-600',
            emerald: 'text-emerald-600',
            rose: 'text-rose-600'
          };

          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className={`text-left p-4 rounded-xl border bg-gradient-to-br ${colorMap[section.color]} hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${iconColorMap[section.color]}`} />
                <p className="font-semibold text-slate-900 text-sm">{section.title}</p>
              </div>
              <p className="text-sm text-slate-700 line-clamp-2">{section.content}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Tips Section */}
      {coaching.tips && coaching.tips.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Lightbulb className="h-5 w-5" />
              Smart Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coaching.tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{tip.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{tip.description}</p>
                      {tip.relatedHabit && (
                        <div className="mt-2 inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          {tip.relatedHabit}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nudges Section */}
      {coaching.nudges && coaching.nudges.length > 0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Zap className="h-5 w-5" />
              Gentle Nudges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coaching.nudges.map((nudge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-orange-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">📌</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{nudge.habit}</p>
                      <p className="text-slate-700 mt-1">{nudge.message}</p>
                      <p className="text-xs text-slate-500 mt-2 italic">{nudge.reason}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Correlations */}
      {coaching.moodCorrelations && coaching.moodCorrelations.length > 0 && (
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <TrendingUp className="h-5 w-5" />
              Mood Boosting Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">These habits correlate with better moods!</p>
            <div className="space-y-2">
              {coaching.moodCorrelations.map((corr, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{corr.habit}</span>
                    <span className="text-sm font-semibold text-teal-600">+{corr.moodDifference} mood</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      {coaching.stats && (
        <div className="grid grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-white rounded-lg border border-slate-200 text-center"
          >
            <p className="text-2xl font-bold text-violet-600">{coaching.stats.totalHabits}</p>
            <p className="text-xs text-slate-600 mt-1">Total</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-white rounded-lg border border-slate-200 text-center"
          >
            <p className="text-2xl font-bold text-emerald-600">{coaching.stats.improvingCount}</p>
            <p className="text-xs text-slate-600 mt-1">Improving</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-white rounded-lg border border-slate-200 text-center"
          >
            <p className="text-2xl font-bold text-orange-600">{coaching.stats.moodAverage}</p>
            <p className="text-xs text-slate-600 mt-1">Mood</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-white rounded-lg border border-slate-200 text-center"
          >
            <p className="text-2xl font-bold text-blue-600">{coaching.stats.energyAverage}</p>
            <p className="text-xs text-slate-600 mt-1">Energy</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}