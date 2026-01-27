import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const priorityColors = {
  high: "border-l-rose-400 bg-rose-50/50",
  medium: "border-l-amber-400 bg-amber-50/50",
  low: "border-l-emerald-400 bg-emerald-50/50"
};

export default function DayTimeline({ tasks }) {
  const scheduledTasks = tasks
    .filter(t => t.scheduled_time && t.status !== 'completed')
    .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  if (scheduledTasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock className="h-8 w-8 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm">No scheduled tasks for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scheduledTasks.map((task, index) => {
        const [hours, minutes] = task.scheduled_time.split(':').map(Number);
        const isPast = hours < currentHour || (hours === currentHour && minutes < currentMinutes);
        const isCurrent = hours === currentHour;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all",
              priorityColors[task.priority] || "border-l-slate-300 bg-slate-50/50",
              isPast && "opacity-50"
            )}
          >
            {isCurrent && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
            
            <div className="text-sm font-medium text-slate-500 w-14 flex-shrink-0">
              {task.scheduled_time}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-slate-800",
                isPast && "line-through text-slate-500"
              )}>
                {task.title}
              </p>
              {task.duration_minutes && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {task.duration_minutes} min
                </p>
              )}
            </div>

            {task.status === 'completed' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}