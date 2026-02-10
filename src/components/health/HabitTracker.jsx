import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X, Flame, Target, Dumbbell, Brain, BookOpen, Users, Sparkles } from 'lucide-react';

const categoryIcons = {
  health: Sparkles,
  productivity: Target,
  mindfulness: Brain,
  fitness: Dumbbell,
  learning: BookOpen,
  social: Users,
  other: Flame
};

const categoryColors = {
  health: 'bg-emerald-100 text-emerald-600',
  productivity: 'bg-indigo-100 text-indigo-600',
  mindfulness: 'bg-violet-100 text-violet-600',
  fitness: 'bg-rose-100 text-rose-600',
  learning: 'bg-amber-100 text-amber-600',
  social: 'bg-blue-100 text-blue-600',
  other: 'bg-slate-100 text-slate-600'
};

export default function HabitTracker({ habits, habitLogs, todayLogs, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'health' });
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const createHabit = useMutation({
    mutationFn: (data) => base44.entities.Habit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setNewHabit({ name: '', category: 'health' });
    }
  });

  const toggleHabit = useMutation({
    mutationFn: async ({ habitId, isCompleted }) => {
      const existingLog = todayLogs.find(l => l.habit_id === habitId);
      if (existingLog) {
        return base44.entities.HabitLog.delete(existingLog.id);
      } else {
        return base44.entities.HabitLog.create({ habit_id: habitId, date: today, completed: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      onUpdate?.();
    }
  });

  // Calculate streaks
  const getStreak = (habitId) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const hasLog = habitLogs.some(l => l.habit_id === habitId && l.date === date);
      if (hasLog) streak++;
      else if (i > 0) break; // Break if not consecutive (but allow today to be incomplete)
    }
    return streak;
  };

  // Last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

  return (
    <div className="space-y-4">
      {/* Add Habit */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full border-dashed border-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-4"
        >
          <div className="flex gap-2 mb-3">
            <Input
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Habit name"
              className="flex-1"
            />
            <Select value={newHabit.category} onValueChange={(v) => setNewHabit({ ...newHabit, category: v })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categoryIcons).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => createHabit.mutate(newHabit)}
              disabled={!newHabit.name.trim()}
              className="flex-1 bg-rose-600 hover:bg-rose-700"
            >
              Add
            </Button>
          </div>
        </motion.div>
      )}

      {/* Habits List */}
      <AnimatePresence mode="popLayout">
        {habits.map((habit, i) => {
          const Icon = categoryIcons[habit.category] || Flame;
          const isCompleted = todayLogs.some(l => l.habit_id === habit.id);
          const streak = getStreak(habit.id);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit.mutate({ habitId: habit.id, isCompleted })}
                  className={`p-3 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </button>
                
                <div className="flex-1">
                  <p className={`font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[habit.category] || categoryColors.other}`}>
                      {habit.category}
                    </span>
                    {streak > 0 && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {streak} day streak
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini calendar */}
                <div className="flex gap-1">
                  {last7Days.map(date => {
                    const hasLog = habitLogs.some(l => l.habit_id === habit.id && l.date === date);
                    const isToday = date === today;
                    return (
                      <div
                        key={date}
                        className={`w-2.5 h-2.5 rounded-full ${
                          hasLog 
                            ? 'bg-emerald-500' 
                            : isToday 
                              ? 'bg-slate-300' 
                              : 'bg-slate-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {habits.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-rose-200 mx-auto mb-3" />
          <p className="text-slate-500">No habits yet</p>
          <p className="text-xs text-slate-400 mt-1">Start building positive routines</p>
        </div>
      )}
    </div>
  );
}