import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Flame, Activity, Loader2, Sparkles,
} from 'lucide-react';

const categories = [
  'health', 'productivity', 'mindfulness', 'fitness', 'learning', 'social', 'other',
];

const categoryColors = {
  health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  mindfulness: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  fitness: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  learning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function Habits() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'other' });

  // Fetch habits
  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => db.list('habits', { orderBy: 'created_at', ascending: true }),
  });

  const activeHabits = habits.filter((h) => h.active !== false);

  // Fetch today's logs
  const { data: todayLogs = [] } = useQuery({
    queryKey: ['habit_logs', 'today'],
    queryFn: () => db.filter('habit_logs', { date: today }),
  });

  // Fetch last 7 days of logs for weekly view
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
  const { data: weekLogs = [] } = useQuery({
    queryKey: ['habit_logs', 'week'],
    queryFn: async () => {
      const allLogs = [];
      for (const date of last7Days) {
        const logs = await db.filter('habit_logs', { date });
        allLogs.push(...logs);
      }
      return allLogs;
    },
  });

  // Create habit mutation
  const createHabit = useMutation({
    mutationFn: (habit) => db.create('habits', habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created!');
      setNewHabit({ name: '', category: 'other' });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Toggle habit log
  const toggleHabit = useMutation({
    mutationFn: async ({ habitId, isCompleted, logId }) => {
      if (isCompleted && logId) {
        await db.remove('habit_logs', logId);
      } else {
        await db.create('habit_logs', { habit_id: habitId, date: today, completed: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_logs'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const getLogForHabit = (habitId) => todayLogs.find((l) => l.habit_id === habitId && l.completed);

  // Calculate streaks (simplified: count consecutive days with logs)
  const getStreak = (habitId) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const hasLog = weekLogs.some((l) => l.habit_id === habitId && l.date === date && l.completed);
      if (i === 0 && !hasLog) {
        // Check if today is not logged yet; don't break streak
        continue;
      }
      if (hasLog) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;
    createHabit.mutate({ name: newHabit.name.trim(), category: newHabit.category });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Habits
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Build consistency, one day at a time
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
            <DialogHeader>
              <DialogTitle className={cn(isDark && 'text-white')}>New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Habit Name</Label>
                <Input
                  placeholder="e.g., Drink 8 glasses of water"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Category</Label>
                <Select value={newHabit.category} onValueChange={(v) => setNewHabit((prev) => ({ ...prev, category: v }))}>
                  <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className={cn('capitalize', isDark && 'text-slate-200')}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createHabit.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {createHabit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Checklist */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            Today&apos;s Checklist
          </CardTitle>
          <CardDescription className={cn(isDark && 'text-slate-400')}>
            {format(new Date(), 'EEEE, MMMM d')} &mdash; {todayLogs.filter((l) => l.completed).length}/{activeHabits.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeHabits.length === 0 ? (
            <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No habits yet</p>
              <p className="text-sm mt-1">Create your first habit to start building streaks!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeHabits.map((habit) => {
                const log = getLogForHabit(habit.id);
                const isCompleted = !!log;
                const streak = getStreak(habit.id);

                return (
                  <div
                    key={habit.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-colors',
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50',
                      isCompleted && (isDark ? 'bg-slate-800/50' : 'bg-green-50/50')
                    )}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() =>
                        toggleHabit.mutate({ habitId: habit.id, isCompleted, logId: log?.id })
                      }
                      className={cn(
                        'border-2',
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                          : isDark ? 'border-slate-600' : 'border-slate-300'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-sm font-medium',
                        isCompleted ? (isDark ? 'text-slate-400 line-through' : 'text-slate-500 line-through') : (isDark ? 'text-white' : 'text-slate-900')
                      )}>
                        {habit.name}
                      </span>
                    </div>
                    <Badge className={cn('text-xs capitalize', categoryColors[habit.category] || categoryColors.other)}>
                      {habit.category}
                    </Badge>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4" />
                        <span className="text-xs font-bold">{streak}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly View */}
      {activeHabits.length > 0 && (
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardHeader>
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={cn('text-left py-2 pr-4 font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Habit
                    </th>
                    {last7Days.map((date) => (
                      <th key={date} className={cn('text-center py-2 px-2 font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        <div className="text-xs">{format(new Date(date + 'T12:00:00'), 'EEE')}</div>
                        <div className="text-xs">{format(new Date(date + 'T12:00:00'), 'd')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeHabits.map((habit) => (
                    <tr key={habit.id} className={cn('border-t', isDark ? 'border-slate-800' : 'border-slate-100')}>
                      <td className={cn('py-3 pr-4 truncate max-w-[120px]', isDark ? 'text-slate-200' : 'text-slate-700')}>
                        {habit.name}
                      </td>
                      {last7Days.map((date) => {
                        const hasLog = weekLogs.some(
                          (l) => l.habit_id === habit.id && l.date === date && l.completed
                        );
                        return (
                          <td key={date} className="text-center py-3 px-2">
                            <div className={cn(
                              'h-7 w-7 rounded-lg mx-auto flex items-center justify-center',
                              hasLog
                                ? 'bg-green-500 text-white'
                                : isDark ? 'bg-slate-800' : 'bg-slate-100'
                            )}>
                              {hasLog && <Activity className="h-3.5 w-3.5" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
