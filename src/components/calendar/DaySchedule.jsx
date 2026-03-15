import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, Trash2, Edit2, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SummaryGenerator from './SummaryGenerator';
import MeetingSummaryPanel from './MeetingSummaryPanel';
import { cn } from "@/lib/utils";

const priorityColors = {
  high: 'border-l-4 border-red-500 bg-red-50',
  medium: 'border-l-4 border-amber-500 bg-amber-50',
  low: 'border-l-4 border-blue-500 bg-blue-50'
};

const categoryColors = {
  'Work': 'bg-indigo-100 text-indigo-800',
  'Personal': 'bg-purple-100 text-purple-800',
  'Health': 'bg-emerald-100 text-emerald-800',
  'General': 'bg-slate-100 text-slate-800'
};

export default function DaySchedule({ date, tasks, onEdit, onDelete, onToggle, fullScreen }) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [showSummaryGenerator, setShowSummaryGenerator] = useState(null);

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
    <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5", fullScreen ? "w-full" : "sticky top-6")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {format(date, 'EEEE')}
            </h3>
            <p className="text-xs text-slate-400">{format(date, 'MMMM d, yyyy')}</p>
          </div>
        </div>
        {tasks.length > 0 && (
          <span className="text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {tasks.length} event{tasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-slate-200">
            <Calendar className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm font-medium">No events today</p>
          <p className="text-slate-300 text-xs mt-1">Select a date or add an event</p>
        </div>
      ) : (
        <div className={cn("space-y-3", fullScreen ? "max-h-screen overflow-y-auto" : "max-h-[600px] overflow-y-auto")}>
          <AnimatePresence>
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn("group",
                  "border rounded-xl p-3.5 transition-all",
                  task.status === 'completed' 
                    ? "bg-slate-50/60 border-slate-100 opacity-50" 
                    : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm",
                  task.priority === 'high' && task.status !== 'completed' && "border-l-[3px] border-l-rose-400",
                  task.priority === 'medium' && task.status !== 'completed' && "border-l-[3px] border-l-amber-400",
                  task.priority === 'low' && task.status !== 'completed' && "border-l-[3px] border-l-emerald-400",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggle(task)}
                    className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-400" />
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
                  
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-600"
                      title="View meeting summary"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedTask === task.id ? 'rotate-180' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task)}
                      className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {expandedTask === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-slate-200"
                  >
                    <MeetingSummaryPanel taskId={task.id} onGenerateClick={() => setShowSummaryGenerator(task)} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <AnimatePresence>
        {showSummaryGenerator && (
          <SummaryGenerator
            task={showSummaryGenerator}
            onClose={() => setShowSummaryGenerator(null)}
            onSummaryGenerated={() => {
              setShowSummaryGenerator(null);
              setExpandedTask(showSummaryGenerator.id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}