import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from "@/lib/utils";

const priorityColors = {
  high: 'bg-red-50 border-l-4 border-red-500',
  medium: 'bg-amber-50 border-l-4 border-amber-500',
  low: 'bg-blue-50 border-l-4 border-blue-500'
};

const priorityDotColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500'
};

const categoryColors = {
  'Work': 'bg-indigo-100 text-indigo-800',
  'Personal': 'bg-purple-100 text-purple-800',
  'Health': 'bg-emerald-100 text-emerald-800',
  'General': 'bg-slate-100 text-slate-800'
};

export default function WeeklyView({ date, tasks, onEdit, onDelete, onToggle }) {
  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTasksForDay = (day) => {
    return tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), day))
      .sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border rounded-xl p-2.5 min-h-[480px] overflow-y-auto flex flex-col",
                isToday ? "border-indigo-300 bg-indigo-50/50" : "border-slate-100 bg-slate-50/50"
              )}
            >
              <div className={cn(
                "text-center mb-3 pb-2.5 border-b",
                isToday ? "border-indigo-200" : "border-slate-200"
              )}>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{format(day, 'EEE')}</div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold",
                  isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                )}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <AnimatePresence>
                  {dayTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={cn(
                        "rounded-lg p-2 text-xs group hover:shadow-sm transition-all cursor-pointer",
                        priorityColors[task.priority] || priorityColors.medium,
                        task.status === 'completed' && "opacity-40"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => onToggle(task)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-slate-900 truncate",
                            task.status === 'completed' && "line-through text-slate-500"
                          )}>
                            {task.title}
                          </p>
                          
                          {task.scheduled_time && (
                            <p className="text-slate-600 text-xs mt-0.5">{task.scheduled_time}</p>
                          )}
                          
                          {task.list_name && (
                            <span className={cn("inline-block mt-1 px-1.5 py-0.5 rounded text-xs", categoryColors[task.list_name] || categoryColors.General)}>
                              {task.list_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(task)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(task)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {dayTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}