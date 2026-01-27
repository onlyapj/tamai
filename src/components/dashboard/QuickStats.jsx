import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function QuickStats({ tasks }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.due_date === todayStr);
  
  const stats = [
    {
      label: 'Completed',
      value: tasks.filter(t => t.status === 'completed').length,
      total: tasks.length,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      label: 'In Progress',
      value: tasks.filter(t => t.status === 'in_progress').length,
      icon: Clock,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      label: 'High Priority',
      value: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    },
    {
      label: 'Due Today',
      value: todayTasks.filter(t => t.status !== 'completed').length,
      icon: Target,
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4"
        >
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
            <stat.icon className={cn("h-5 w-5", stat.color)} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}