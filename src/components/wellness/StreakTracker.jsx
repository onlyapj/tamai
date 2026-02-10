import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays } from 'date-fns';
import { Flame, Target, TrendingUp } from 'lucide-react';

export default function StreakTracker({ habit }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: logs } = useQuery({
    queryKey: ['habit-logs', habit.id],
    queryFn: () => base44.entities.HabitLog.filter({ habit_id: habit.id }, '-date', 100)
  });

  const completeHabitMutation = useMutation({
    mutationFn: (data) => base44.entities.HabitLog.create({
      ...data,
      habit_id: habit.id,
      date: today,
      completed: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs', habit.id] });
      // Update habit streak
      updateStreakMutation.mutate();
    }
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      const allLogs = await base44.entities.HabitLog.filter({ habit_id: habit.id }, '-date', 365);
      
      // Calculate current streak
      let currentStreak = 0;
      const sortedLogs = allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (format(logDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd') && sortedLogs[i].completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      const bestStreak = Math.max(habit.best_streak || 0, currentStreak);
      const progress = habit.target_goal ? Math.min((currentStreak / habit.target_goal) * 100, 100) : 0;

      return base44.entities.Habit.update(habit.id, {
        current_streak: currentStreak,
        best_streak: bestStreak,
        progress: progress,
        last_completed_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  const todayLog = logs?.find(log => log.date === today && log.completed);

  const streakPercentage = habit.target_goal
    ? Math.min((habit.current_streak / habit.target_goal) * 100, 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Streak Display */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{habit.current_streak || 0}</span>
            </div>
            <p className="text-xs text-slate-600">Current Streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span className="text-2xl font-bold text-indigo-600">{habit.best_streak || 0}</span>
            </div>
            <p className="text-xs text-slate-600">Best Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-600">{habit.target_goal || '—'}</span>
            </div>
            <p className="text-xs text-slate-600">Goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress towards Goal */}
      {habit.target_goal && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Progress to Goal</p>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                style={{ width: `${streakPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">{Math.round(streakPercentage)}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      {!todayLog && (
        <Button
          onClick={() => completeHabitMutation.mutate()}
          disabled={completeHabitMutation.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {completeHabitMutation.isPending ? 'Marking...' : 'Mark Complete Today'}
        </Button>
      )}

      {todayLog && (
        <div className="text-center text-emerald-600 font-medium py-2 bg-emerald-50 rounded-lg">
          ✓ Completed today!
        </div>
      )}
    </div>
  );
}