import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function DaySchedule({ date, tasks, onEdit, onDelete, onToggle, fullScreen }) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.scheduled_time) return 1;
    if (!b.scheduled_time) return -1;
    return a.scheduled_time.localeCompare(b.scheduled_time);
  });

  const getReminderText = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m before`;
    return `${minutes / 60}h before`;
  };

  return (
    <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm p-6", fullScreen ? "w-full" : "sticky top-6")}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800">
          {format(date, 'EEEE, MMMM d')}
        </h3>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Circle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No events scheduled</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "border rounded-2xl p-4 transition-all",
                  task.status === 'completed' 
                    ? "bg-slate-50 border-slate-200 opacity-60" 
                    : "bg-white border-slate-200 hover:border-indigo-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggle(task)}
                    className="mt-0.5"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium text-slate-800",
                      task.status === 'completed' && "line-through text-slate-400"
                    )}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          {task.scheduled_time}
                          {task.duration_minutes && ` (${task.duration_minutes}m)`}
                        </div>
                      )}
                      
                      {task.reminder_minutes && (
                        <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          <Bell className="h-3 w-3" />
                          {getReminderText(task.reminder_minutes)}
                        </div>
                      )}
                      
                      <div className={cn(
                        "text-xs px-2 py-1 rounded-lg",
                        task.priority === 'high' && "bg-rose-100 text-rose-700",
                        task.priority === 'medium' && "bg-amber-100 text-amber-700",
                        task.priority === 'low' && "bg-slate-100 text-slate-600"
                      )}>
                        {task.priority}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}