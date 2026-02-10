import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Clock, AlertCircle, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ADHDCoachingPanel() {
  const [expandedSection, setExpandedSection] = useState('focus');

  const { data: coaching, isLoading, error, refetch } = useQuery({
    queryKey: ['adhd-coaching'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeADHDPatterns', {});
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gradient-to-r from-violet-200 to-purple-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !coaching?.success) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-amber-700">{coaching?.message || 'Unable to load ADHD insights'}</p>
        </CardContent>
      </Card>
    );
  }

  const { patterns, recommendations, profile, recentDaysLogged } = coaching;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-violet-600" />
            ADHD Optimization
          </h2>
          <p className="text-sm text-slate-600 mt-1">{profile.adhd_type} • {recentDaysLogged} days logged</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="icon"
          className="text-violet-600 hover:bg-violet-50"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white rounded-lg border border-slate-200"
        >
          <p className="text-xs text-slate-600">Focus Score</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">{patterns.avgFocusScore}/10</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white rounded-lg border border-slate-200"
        >
          <p className="text-xs text-slate-600">Focus Window</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{patterns.avgFocusWindowMinutes}m</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white rounded-lg border border-slate-200"
        >
          <p className="text-xs text-slate-600">Energy Level</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{patterns.avgEnergyLevel}/10</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white rounded-lg border border-slate-200"
        >
          <p className="text-xs text-slate-600">Symptoms</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{patterns.avgSymptomSeverity}/10</p>
        </motion.div>
      </div>

      {/* Focus Strategy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-violet-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Your Best Focus Times</h3>
            <p className="text-sm text-slate-700">{recommendations.focusStrategy}</p>
            {patterns.bestFocusHours.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {patterns.bestFocusHours.map((hour, i) => (
                  <span key={i} className="inline-block px-3 py-1 rounded-full bg-white border border-violet-200 text-xs font-medium text-violet-700">
                    {String(hour.hour).padStart(2, '0')}:00 ({hour.period})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Energy & Symptom Management */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-3">Energy & Symptom Management</h3>
            <ul className="space-y-2">
              {recommendations.energyTips?.map((tip, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Hyperfocus Leverage */}
      {patterns.hyperfocusSessions > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Harness Your Hyperfocus</h3>
              <p className="text-sm text-slate-700 mb-3">{recommendations.hyperfocusGuide}</p>
              {patterns.topHyperfocusTriggers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Your hyperfocus triggers:</p>
                  <div className="flex flex-wrap gap-2">
                    {patterns.topHyperfocusTriggers.map((trigger, i) => (
                      <span key={i} className="inline-block px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-xs text-indigo-700 font-medium">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Routine Optimization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setExpandedSection(expandedSection === 'routine' ? null : 'routine')}
        className="bg-white border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <h3 className="font-semibold text-slate-900">Daily Routine Optimization</h3>
        <AnimatePresence>
          {expandedSection === 'routine' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-100"
            >
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{recommendations.routineOptimization}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Habit Adjustments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setExpandedSection(expandedSection === 'habits' ? null : 'habits')}
        className="bg-white border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <h3 className="font-semibold text-slate-900">ADHD-Friendly Habit Building</h3>
        <AnimatePresence>
          {expandedSection === 'habits' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-100"
            >
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{recommendations.habitAdjustments}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Warning Signs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Warning Signs & Recovery</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{recommendations.warningSignsAndRecovery}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}