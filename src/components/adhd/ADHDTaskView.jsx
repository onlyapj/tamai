import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Target, BookOpen } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function ADHDTaskView({ task, onToggle, onEdit }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!task.scheduled_time || !task.due_date) return;

    const updateTimer = () => {
      const now = new Date();
      const taskDateTime = parse(`${task.due_date} ${task.scheduled_time}`, 'yyyy-MM-dd HH:mm', new Date());
      const diff = taskDateTime - now;

      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining('Overdue');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [task.due_date, task.scheduled_time]);

  // Calculate progress based on priority and time
  const priorityValue = { low: 1, medium: 2, high: 3 }[task.priority] || 1;
  const estimatedPoints = Math.min(100, (task.duration_minutes || 30) / 5 + priorityValue * 20);

  const priorityColor = {
    low: 'from-blue-500 to-cyan-500',
    medium: 'from-orange-500 to-amber-500',
    high: 'from-rose-500 to-red-500'
  }[task.priority] || 'from-slate-500 to-slate-500';

  const statusEmoji = {
    pending: '⏳',
    in_progress: '🚀',
    completed: '✅'
  }[task.status] || '📝';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
        task.status === 'completed'
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white hover:shadow-lg'
      }`}
    >
      {/* Gamified Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
      >
        +{Math.round(estimatedPoints)} pts
      </motion.div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={() => onToggle(task)}
            className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
          >
            <span className="text-2xl">{statusEmoji}</span>
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold transition-all ${
              task.status === 'completed'
                ? 'line-through text-slate-400'
                : 'text-slate-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-1">{task.description}</p>
            )}
          </div>

          {/* Priority Badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${priorityColor} flex items-center justify-center text-white text-xs font-bold`}>
            {task.priority?.[0]?.toUpperCase() || 'M'}
          </div>
        </div>

        {/* Gamified Progress Bar */}
        <div className="mb-3">
          <div className="relative h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              layoutId={`progress-${task.id}`}
              initial={{ width: 0 }}
              animate={{ width: `${estimatedPoints}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg"
            />
          </div>
        </div>

        {/* Task Info Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Duration */}
          {task.duration_minutes && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 text-center"
            >
              <Clock className="h-4 w-4 mx-auto text-indigo-600 mb-0.5" />
              <p className="text-xs font-semibold text-indigo-700">{task.duration_minutes}min</p>
            </motion.div>
          )}

          {/* Time Remaining */}
          {timeRemaining && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-2 bg-gradient-to-br rounded-lg border text-center ${
                timeRemaining === 'Overdue'
                  ? 'from-rose-50 to-red-50 border-rose-100'
                  : 'from-amber-50 to-orange-50 border-amber-100'
              }`}
            >
              <Zap className={`h-4 w-4 mx-auto mb-0.5 ${
                timeRemaining === 'Overdue' ? 'text-rose-600' : 'text-amber-600'
              }`} />
              <p className={`text-xs font-semibold ${
                timeRemaining === 'Overdue' ? 'text-rose-700' : 'text-amber-700'
              }`}>
                {timeRemaining}
              </p>
            </motion.div>
          )}

          {/* Focus Mode */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100 text-center"
          >
            <Target className="h-4 w-4 mx-auto text-purple-600 mb-0.5" />
            <p className="text-xs font-semibold text-purple-700">Focus</p>
          </motion.div>
        </div>

        {/* ADHD-Friendly Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onToggle(task)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8 bg-slate-50 hover:bg-slate-100"
          >
            {task.status === 'completed' ? 'Undo' : 'Done'}
          </Button>
          <Button
            onClick={() => onEdit(task)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8 bg-violet-50 hover:bg-violet-100 text-violet-700"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}