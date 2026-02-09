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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDateSelect(currentDay)}
          className={cn(
            "relative p-2 rounded-xl transition-all min-h-[80px] flex flex-col",
            !isSameMonth(currentDay, monthStart) && "text-slate-300 bg-slate-50/50",
            isSameMonth(currentDay, monthStart) && "text-slate-700 hover:bg-indigo-50",
            isSameDay(currentDay, selectedDate) && "bg-indigo-100 ring-2 ring-indigo-600",
            isToday(currentDay) && "font-bold border-2 border-indigo-400"
          )}
        >
          <span className={cn(
            "text-sm mb-1",
            isToday(currentDay) && "text-indigo-600"
          )}>
            {format(currentDay, dateFormat)}
          </span>
          
          {incompleteTasks.length > 0 && (
            <div className="flex flex-col gap-0.5 overflow-hidden">
              {incompleteTasks.slice(0, 3).map((task, idx) => (
                <div
                  key={task.id}
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded truncate",
                    task.priority === 'high' && "bg-rose-100 text-rose-700",
                    task.priority === 'medium' && "bg-amber-100 text-amber-700",
                    task.priority === 'low' && "bg-slate-100 text-slate-600"
                  )}
                >
                  {task.scheduled_time && `${task.scheduled_time} `}
                  {task.title}
                </div>
              ))}
              {incompleteTasks.length > 3 && (
                <span className="text-xs text-slate-400 px-1">
                  +{incompleteTasks.length - 3} more
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-2">
        {rows}
      </div>
    </div>
  );
}