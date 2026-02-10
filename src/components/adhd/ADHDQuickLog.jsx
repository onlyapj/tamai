import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Battery, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ADHDQuickLog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [quick, setQuick] = useState({
    focus_score: 5,
    symptom_severity: 5,
    energy_level: 5
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Create a quick log entry
      return await base44.entities.ADHDLog.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        focus_score: data.focus_score,
        symptom_severity: data.symptom_severity,
        energy_level: data.energy_level,
        notes: 'Quick log from dashboard'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhd-logs'] });
      queryClient.invalidateQueries({ queryKey: ['adhd-coaching'] });
      setIsOpen(false);
      setQuick({ focus_score: 5, symptom_severity: 5, energy_level: 5 });
    }
  });

  const getEmoji = (type, value) => {
    if (type === 'focus') {
      if (value <= 3) return '🤯';
      if (value <= 6) return '😐';
      return '🎯';
    }
    if (type === 'energy') {
      if (value <= 3) return '💀';
      if (value <= 6) return '😴';
      return '⚡';
    }
    if (type === 'symptom') {
      if (value <= 3) return '✨';
      if (value <= 6) return '😕';
      return '🌪️';
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 lg:bottom-6 right-4 lg:right-20 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-all z-40"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-semibold">Log ADHD</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-28 lg:bottom-6 right-4 lg:right-20 z-50 w-80"
    >
      <Card className="border-violet-200 bg-white shadow-xl">
        <div className="p-4 border-b border-violet-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Quick ADHD Check-in</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Focus Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Brain className="h-4 w-4 text-violet-600" />
                Focus: {quick.focus_score}/10
              </label>
              <span className="text-lg">{getEmoji('focus', quick.focus_score)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={quick.focus_score}
              onChange={(e) => setQuick(prev => ({ ...prev, focus_score: parseInt(e.target.value) }))}
              className="w-full h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Battery className="h-4 w-4 text-orange-600" />
                Energy: {quick.energy_level}/10
              </label>
              <span className="text-lg">{getEmoji('energy', quick.energy_level)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={quick.energy_level}
              onChange={(e) => setQuick(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Symptom Severity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Zap className="h-4 w-4 text-rose-600" />
                Symptoms: {quick.symptom_severity}/10
              </label>
              <span className="text-lg">{getEmoji('symptom', quick.symptom_severity)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={quick.symptom_severity}
              onChange={(e) => setQuick(prev => ({ ...prev, symptom_severity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={() => saveMutation.mutate(quick)}
            disabled={saveMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Check-in'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}