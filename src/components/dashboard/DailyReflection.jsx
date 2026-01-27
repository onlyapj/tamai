import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Sun, Moon, X, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

const moods = [
  { value: 8, icon: Smile, label: 'Great', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { value: 5, icon: Meh, label: 'Okay', color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { value: 2, icon: Frown, label: 'Tough', color: 'text-rose-500 bg-rose-50 border-rose-200' }
];

export default function DailyReflection({ type = 'morning', existingEntry, onComplete }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showReflection, setShowReflection] = useState(!existingEntry);
  const queryClient = useQueryClient();

  const saveMood = useMutation({
    mutationFn: async (moodScore) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existing = await base44.entities.MoodEntry.filter({ date: today });
      if (existing.length > 0) {
        return base44.entities.MoodEntry.update(existing[0].id, { mood_score: moodScore });
      }
      return base44.entities.MoodEntry.create({ mood_score: moodScore, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moodEntries']);
      setShowReflection(false);
      onComplete?.();
    }
  });

  const isMorning = type === 'morning';
  const greeting = isMorning 
    ? "Good morning! How do you feel today?" 
    : "How was your day?";

  if (!showReflection) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-100 mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isMorning ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
            <span className="font-medium text-slate-700">{greeting}</span>
          </div>
          <button 
            onClick={() => setShowReflection(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 justify-center">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => {
                setSelectedMood(mood.value);
                saveMood.mutate(mood.value);
              }}
              disabled={saveMood.isPending}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.value 
                  ? mood.color + ' scale-105' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <mood.icon className={`h-8 w-8 ${selectedMood === mood.value ? '' : 'text-slate-400'}`} />
              <span className={`text-sm font-medium ${selectedMood === mood.value ? '' : 'text-slate-600'}`}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {saveMood.isPending && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Saving...
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}