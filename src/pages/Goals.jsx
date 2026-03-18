import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Target, Loader2, Calendar, Trophy,
} from 'lucide-react';

const goalCategories = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Fitness', 'Creative', 'Other'];

const statusConfig = {
  active: { label: 'Active', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  paused: { label: 'Paused', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  at_risk: { label: 'At Risk', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
};

export default function Goals() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressGoal, setProgressGoal] = useState(null);
  const [progressValue, setProgressValue] = useState([0]);
  const [goalForm, setGoalForm] = useState({
    title: '', description: '', target_date: '', category: '',
  });

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.list('goals', { orderBy: 'created_at', ascending: false }),
  });

  // Create goal
  const createGoal = useMutation({
    mutationFn: (data) => db.create('goals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created!');
      setGoalForm({ title: '', description: '', target_date: '', category: '' });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Update goal
  const updateGoal = useMutation({
    mutationFn: ({ id, updates }) => db.update('goals', id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated!');
      setProgressGoal(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    createGoal.mutate({
      title: goalForm.title.trim(),
      description: goalForm.description,
      target_date: goalForm.target_date || null,
      category: goalForm.category || null,
      status: 'active',
      progress: 0,
    });
  };

  const handleUpdateProgress = () => {
    if (!progressGoal) return;
    const newProgress = progressValue[0];
    const status = newProgress >= 100 ? 'completed' : progressGoal.status;
    updateGoal.mutate({ id: progressGoal.id, updates: { progress: newProgress, status } });
  };

  const handleStatusChange = (goalId, newStatus) => {
    updateGoal.mutate({ id: goalId, updates: { status: newStatus } });
  };

  const activeGoals = goals.filter((g) => g.status === 'active' || g.status === 'at_risk');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const pausedGoals = goals.filter((g) => g.status === 'paused');

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
            Goals
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Set ambitious goals and track your journey
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
            <DialogHeader>
              <DialogTitle className={cn(isDark && 'text-white')}>Create Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Title</Label>
                <Input
                  placeholder="e.g., Run a marathon"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Description</Label>
                <Textarea
                  placeholder="What does achieving this goal look like?"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Target Date</Label>
                  <Input
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) => setGoalForm((p) => ({ ...p, target_date: e.target.value }))}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Category</Label>
                  <Select value={goalForm.category} onValueChange={(v) => setGoalForm((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                      {goalCategories.map((c) => (
                        <SelectItem key={c} value={c} className={cn(isDark && 'text-slate-200')}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createGoal.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {createGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Goal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Update Dialog */}
      <Dialog open={!!progressGoal} onOpenChange={(open) => !open && setProgressGoal(null)}>
        <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
          <DialogHeader>
            <DialogTitle className={cn(isDark && 'text-white')}>Update Progress</DialogTitle>
          </DialogHeader>
          {progressGoal && (
            <div className="space-y-6">
              <div>
                <p className={cn('font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                  {progressGoal.title}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Current progress: {Math.round(progressGoal.progress || 0)}%
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={cn(isDark && 'text-slate-300')}>New Progress</Label>
                  <span className={cn('text-sm font-bold', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                    {progressValue[0]}%
                  </span>
                </div>
                <Slider
                  value={progressValue}
                  onValueChange={setProgressValue}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleUpdateProgress}
                  disabled={updateGoal.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {updateGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardContent className="py-16 text-center">
            <Target className={cn('h-16 w-16 mx-auto mb-4 opacity-30', isDark ? 'text-slate-500' : 'text-slate-300')} />
            <h3 className={cn('text-lg font-semibold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
              No Goals Yet
            </h3>
            <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Set your first goal and start making progress toward what matters most.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Active Goals ({activeGoals.length})
          </h2>
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isDark={isDark}
              onUpdateProgress={() => {
                setProgressGoal(goal);
                setProgressValue([Math.round(goal.progress || 0)]);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className={cn('text-lg font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
            <Trophy className="h-5 w-5 text-amber-500" />
            Completed ({completedGoals.length})
          </h2>
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isDark={isDark}
              onUpdateProgress={() => {
                setProgressGoal(goal);
                setProgressValue([Math.round(goal.progress || 0)]);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className={cn('text-lg font-semibold', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Paused ({pausedGoals.length})
          </h2>
          {pausedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isDark={isDark}
              onUpdateProgress={() => {
                setProgressGoal(goal);
                setProgressValue([Math.round(goal.progress || 0)]);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, isDark, onUpdateProgress, onStatusChange }) {
  const progress = Math.round(goal.progress || 0);
  const status = statusConfig[goal.status] || statusConfig.active;

  return (
    <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('font-semibold truncate', isDark ? 'text-white' : 'text-slate-900')}>
                {goal.title}
              </h3>
              <Badge className={cn('text-xs flex-shrink-0', status.className)}>
                {status.label}
              </Badge>
            </div>
            {goal.description && (
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {goal.description}
              </p>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Progress</span>
            <span className={cn('text-xs font-bold', isDark ? 'text-indigo-400' : 'text-indigo-600')}>
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            className={cn('h-2.5', isDark ? 'bg-slate-800' : 'bg-slate-100')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            {goal.category && (
              <Badge variant="outline" className={cn('text-xs', isDark && 'border-slate-700 text-slate-400')}>
                {goal.category}
              </Badge>
            )}
            {goal.target_date && (
              <span className={cn('flex items-center gap-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                <Calendar className="h-3 w-3" />
                {format(new Date(goal.target_date + 'T12:00:00'), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {goal.status !== 'completed' && (
              <Select
                value={goal.status}
                onValueChange={(v) => onStatusChange(goal.id, v)}
              >
                <SelectTrigger className={cn('h-8 w-24 text-xs', isDark && 'bg-slate-800 border-slate-700 text-white')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                  <SelectItem value="active" className={cn('text-xs', isDark && 'text-slate-200')}>Active</SelectItem>
                  <SelectItem value="paused" className={cn('text-xs', isDark && 'text-slate-200')}>Paused</SelectItem>
                  <SelectItem value="at_risk" className={cn('text-xs', isDark && 'text-slate-200')}>At Risk</SelectItem>
                  <SelectItem value="completed" className={cn('text-xs', isDark && 'text-slate-200')}>Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateProgress}
              className={cn('text-xs', isDark && 'border-slate-700 text-slate-300 hover:bg-slate-800')}
            >
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
