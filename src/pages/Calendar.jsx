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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, CalendarDays, Loader2, Filter, CheckSquare, Clock, Trash2,
} from 'lucide-react';

const priorityConfig = {
  low: { label: 'Low', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
};

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  in_progress: { label: 'In Progress', className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400' },
  completed: { label: 'Done', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

export default function Calendar() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', due_date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium', status: 'pending',
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => db.list('tasks', { orderBy: 'due_date', ascending: true }),
  });

  // Create task
  const createTask = useMutation({
    mutationFn: (data) => db.create('tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created!');
      setTaskForm({
        title: '', description: '', due_date: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium', status: 'pending',
      });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Update task status
  const updateTask = useMutation({
    mutationFn: ({ id, updates }) => db.update('tasks', id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: (id) => db.remove('tasks', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    createTask.mutate({
      title: taskForm.title.trim(),
      description: taskForm.description,
      due_date: taskForm.due_date || null,
      priority: taskForm.priority,
      status: taskForm.status,
    });
  };

  const toggleComplete = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ id: task.id, updates: { status: newStatus } });
  };

  // Filtered tasks
  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  // Group tasks by date
  const grouped = {};
  filteredTasks.forEach((task) => {
    const dateKey = task.due_date || 'No Due Date';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(task);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return a.localeCompare(b);
  });

  const today = format(new Date(), 'yyyy-MM-dd');

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
            Tasks
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Manage your tasks and stay organized
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
            <DialogHeader>
              <DialogTitle className={cn(isDark && 'text-white')}>New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Title</Label>
                <Input
                  placeholder="What needs to be done?"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Description</Label>
                <Textarea
                  placeholder="Add more details (optional)"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Due Date</Label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm((p) => ({ ...p, due_date: e.target.value }))}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                      <SelectItem value="low" className={cn(isDark && 'text-slate-200')}>Low</SelectItem>
                      <SelectItem value="medium" className={cn(isDark && 'text-slate-200')}>Medium</SelectItem>
                      <SelectItem value="high" className={cn(isDark && 'text-slate-200')}>High</SelectItem>
                      <SelectItem value="urgent" className={cn(isDark && 'text-slate-200')}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createTask.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className={cn('h-4 w-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
        {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={cn(
              'text-xs capitalize',
              filterStatus === status
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''
            )}
          >
            {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardContent className="py-16 text-center">
            <CheckSquare className={cn('h-16 w-16 mx-auto mb-4 opacity-30', isDark ? 'text-slate-500' : 'text-slate-300')} />
            <h3 className={cn('text-lg font-semibold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
              {filterStatus === 'all' ? 'No Tasks Yet' : 'No Matching Tasks'}
            </h3>
            <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {filterStatus === 'all'
                ? 'Create your first task to get organized.'
                : 'Try a different filter to see more tasks.'}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const isToday = dateKey === today;
            const isPast = dateKey !== 'No Due Date' && dateKey < today;

            return (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className={cn('h-4 w-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
                  <h3 className={cn(
                    'text-sm font-semibold',
                    isToday ? (isDark ? 'text-indigo-400' : 'text-indigo-600') :
                    isPast ? 'text-red-500' :
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    {dateKey === 'No Due Date'
                      ? 'No Due Date'
                      : isToday
                        ? `Today - ${format(new Date(dateKey + 'T12:00:00'), 'MMM d, yyyy')}`
                        : format(new Date(dateKey + 'T12:00:00'), 'EEEE, MMM d, yyyy')}
                  </h3>
                  {isPast && <Badge className="text-xs bg-red-100 text-red-700">Overdue</Badge>}
                </div>
                <div className="space-y-2">
                  {grouped[dateKey].map((task) => {
                    const priority = priorityConfig[task.priority] || priorityConfig.medium;
                    const isCompleted = task.status === 'completed';

                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          'border transition-all',
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
                          isCompleted && 'opacity-60'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleComplete(task)}
                              className={cn(
                                'mt-0.5 border-2',
                                isCompleted
                                  ? 'border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                                  : isDark ? 'border-slate-600' : 'border-slate-300'
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  'font-medium text-sm',
                                  isCompleted
                                    ? (isDark ? 'text-slate-500 line-through' : 'text-slate-400 line-through')
                                    : (isDark ? 'text-white' : 'text-slate-900')
                                )}>
                                  {task.title}
                                </span>
                                <Badge className={cn('text-xs', priority.className)}>
                                  {priority.label}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!isCompleted && (
                                <Select
                                  value={task.status}
                                  onValueChange={(v) => updateTask.mutate({ id: task.id, updates: { status: v } })}
                                >
                                  <SelectTrigger className={cn('h-7 w-24 text-xs', isDark && 'bg-slate-800 border-slate-700 text-white')}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                                    <SelectItem value="pending" className={cn('text-xs', isDark && 'text-slate-200')}>Pending</SelectItem>
                                    <SelectItem value="in_progress" className={cn('text-xs', isDark && 'text-slate-200')}>In Progress</SelectItem>
                                    <SelectItem value="completed" className={cn('text-xs', isDark && 'text-slate-200')}>Done</SelectItem>
                                    <SelectItem value="cancelled" className={cn('text-xs', isDark && 'text-slate-200')}>Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask.mutate(task.id)}
                                className={cn('h-7 w-7 p-0', isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
