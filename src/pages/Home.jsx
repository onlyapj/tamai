import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Activity, Smile, Wallet, Plus,
  Target, CalendarDays, Heart, ArrowRight,
  Sparkles, Sun, Moon, Sunrise, Sunset,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'Good night', icon: Moon };
  if (hour < 12) return { text: 'Good morning', icon: Sunrise };
  if (hour < 17) return { text: 'Good afternoon', icon: Sun };
  if (hour < 21) return { text: 'Good evening', icon: Sunset };
  return { text: 'Good night', icon: Moon };
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = user?.theme === 'dark';
  const today = format(new Date(), 'yyyy-MM-dd');
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Tasks due today
  const { data: todayTasks = [] } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => db.filter('tasks', { due_date: today, status: 'pending' }),
  });

  // Habits
  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => db.list('habits', { orderBy: 'created_at', ascending: true }),
  });

  // Today's habit logs
  const { data: todayHabitLogs = [] } = useQuery({
    queryKey: ['habit_logs', 'today'],
    queryFn: () => db.filter('habit_logs', { date: today }),
  });

  // Today's mood
  const { data: todayMood = [] } = useQuery({
    queryKey: ['mood_entries', 'today'],
    queryFn: () => db.filter('mood_entries', { date: today }),
  });

  // This month's transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => db.list('transactions', { orderBy: 'date', ascending: false, limit: 50 }),
  });

  // Recent goals
  const { data: goals = [] } = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: () => db.filter('goals', { status: 'active' }, { orderBy: 'created_at', ascending: false, limit: 3 }),
  });

  const completedHabits = todayHabitLogs.filter((l) => l.completed).length;
  const totalHabits = habits.filter((h) => h.active !== false).length;
  const moodScore = todayMood.length > 0 ? todayMood[0].mood_score : null;

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthTransactions = transactions.filter((t) => t.date?.startsWith(currentMonth));
  const monthIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpenses = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const budgetRemaining = monthIncome - monthExpenses;

  const statCards = [
    {
      label: 'Tasks Due Today',
      value: todayTasks.length,
      icon: CheckSquare,
      color: 'text-blue-600',
      bg: isDark ? 'bg-blue-950' : 'bg-blue-50',
    },
    {
      label: 'Habits Completed',
      value: `${completedHabits}/${totalHabits}`,
      icon: Activity,
      color: 'text-green-600',
      bg: isDark ? 'bg-green-950' : 'bg-green-50',
    },
    {
      label: 'Mood Score',
      value: moodScore !== null ? `${moodScore}/10` : '--',
      icon: Smile,
      color: 'text-amber-600',
      bg: isDark ? 'bg-amber-950' : 'bg-amber-50',
    },
    {
      label: 'Net This Month',
      value: `${user?.currency || '$'}${budgetRemaining >= 0 ? '' : '-'}${Math.abs(budgetRemaining).toFixed(0)}`,
      icon: Wallet,
      color: budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: isDark ? 'bg-emerald-950' : 'bg-emerald-50',
    },
  ];

  const quickActions = [
    { label: 'Add Task', icon: CalendarDays, path: '/calendar' },
    { label: 'Log Mood', icon: Smile, path: '/mood' },
    { label: 'Track Health', icon: Heart, path: '/health' },
    { label: 'Add Expense', icon: Wallet, path: '/finance' },
    { label: 'New Goal', icon: Target, path: '/goals' },
    { label: 'Habits', icon: Activity, path: '/habits' },
  ];

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GreetingIcon className={cn('h-5 w-5', isDark ? 'text-amber-400' : 'text-amber-500')} />
            <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              {greeting.text}, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Mood Check-in Prompt */}
      {moodScore === null && (
        <Card className={cn(
          'border-dashed',
          isDark ? 'bg-indigo-950/50 border-indigo-800' : 'bg-indigo-50/50 border-indigo-200'
        )}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', isDark ? 'bg-indigo-900' : 'bg-indigo-100')}>
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  How are you feeling today?
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Take a moment to log your mood and reflect.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/mood')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Log Mood
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
              <div className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                {stat.value}
              </div>
              <div className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader className="pb-3">
          <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                  isDark
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                )}
              >
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center',
                  isDark ? 'bg-slate-800' : 'bg-indigo-50'
                )}>
                  <action.icon className={cn('h-5 w-5', isDark ? 'text-indigo-400' : 'text-indigo-600')} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Today&apos;s Tasks
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
              className={cn(isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className={cn('text-center py-8', isDark ? 'text-slate-500' : 'text-slate-400')}>
                <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks due today. Enjoy your day!</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/calendar')}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg',
                      isDark ? 'bg-slate-800' : 'bg-slate-50'
                    )}
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full flex-shrink-0',
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    )} />
                    <span className={cn('text-sm flex-1 truncate', isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Active Goals
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/goals')}
              className={cn(isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className={cn('text-center py-8', isDark ? 'text-slate-500' : 'text-slate-400')}>
                <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active goals yet. Set one to get started!</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/goals')}
                >
                  <Plus className="h-4 w-4 mr-1" /> Set Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={cn(
                      'p-3 rounded-lg',
                      isDark ? 'bg-slate-800' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('text-sm font-medium truncate', isDark ? 'text-slate-200' : 'text-slate-700')}>
                        {goal.title}
                      </span>
                      <span className={cn('text-xs font-medium', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                        {Math.round(goal.progress || 0)}%
                      </span>
                    </div>
                    <div className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-slate-700' : 'bg-slate-200')}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
