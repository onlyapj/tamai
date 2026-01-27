import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

export default function TopPriorities({ tasks, onToggle }) {
  // Get top 3 high priority tasks for today
  const topTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    })
    .slice(0, 3);

  if (topTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 text-center">
        <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-slate-600 font-medium">No priorities yet</p>
        <p className="text-sm text-slate-400">Add tasks to see your top 3 focus items</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Today's Top 3</h3>
        <span className="text-xs text-slate-400">Focus on what matters</span>
      </div>
      <div className="p-2">
        {topTasks.map((task, i) => (
          <motion.button
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onToggle(task)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              task.priority === 'high' 
                ? 'bg-rose-100 text-rose-600' 
                : task.priority === 'medium'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-slate-700 truncate ${
                task.status === 'completed' ? 'line-through text-slate-400' : ''
              }`}>
                {task.title}
              </p>
              {task.scheduled_time && (
                <p className="text-xs text-slate-400">{task.scheduled_time}</p>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}