import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function CalendarView({ tasks, selectedDate, onDateSelect, currentMonth }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  const getTasksForDate = (date) => {
    return tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), date));
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const currentDay = day;
      const dayTasks = getTasksForDate(currentDay);
      const incompleteTasks = dayTasks.filter(t => t.status !== 'completed');
      
      days.push(
        <motion.button
          key={day.toString()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDateSelect(currentDay)}
          className={cn(
            "relative p-2 rounded-xl transition-all min-h-[80px] flex flex-col text-left",
            !isSameMonth(currentDay, monthStart) && "opacity-30",
            isSameMonth(currentDay, monthStart) && "hover:bg-indigo-50/60",
            isSameDay(currentDay, selectedDate) && "bg-indigo-50 ring-2 ring-indigo-500 ring-offset-1",
          )}
        >
          <span className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 leading-none",
            isToday(currentDay) && "bg-indigo-600 text-white font-bold",
            !isToday(currentDay) && isSameMonth(currentDay, monthStart) && "text-slate-700",
            !isToday(currentDay) && isSameDay(currentDay, selectedDate) && "text-indigo-700"
          )}>
            {format(currentDay, dateFormat)}
          </span>
          
          {incompleteTasks.length > 0 && (
            <div className="flex flex-col gap-0.5 overflow-hidden w-full">
              {incompleteTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-md truncate font-medium",
                    task.priority === 'high' && "bg-rose-100 text-rose-700",
                    task.priority === 'medium' && "bg-amber-100 text-amber-700",
                    task.priority === 'low' && "bg-emerald-100 text-emerald-700",
                    (!task.priority) && "bg-slate-100 text-slate-600"
                  )}
                >
                  {task.scheduled_time && <span className="opacity-60">{task.scheduled_time} · </span>}
                  {task.title}
                </div>
              ))}
              {incompleteTasks.length > 2 && (
                <span className="text-xs text-indigo-500 font-medium px-1">
                  +{incompleteTasks.length - 2} more
                </span>
              )}
            </div>
          )}
        </motion.button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-2" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2 tracking-wide uppercase">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1.5">
        {rows}
      </div>
    </div>
  );
}