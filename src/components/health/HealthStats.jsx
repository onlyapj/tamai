import React from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Moon, Footprints, Droplets, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HealthStats({ todayLog, healthLogs }) {
  // Calculate 7-day averages
  const last7Days = healthLogs.slice(0, 7);
  
  const getAvg = (field) => {
    const valid = last7Days.filter(l => l[field] != null);
    return valid.length ? valid.reduce((sum, l) => sum + l[field], 0) / valid.length : null;
  };

  const stats = [
    {
      label: 'Sleep',
      value: todayLog?.sleep_hours,
      unit: 'hours',
      avg: getAvg('sleep_hours'),
      target: 8,
      icon: Moon,
      color: 'indigo',
      tip: 'Aim for 7-9 hours of quality sleep'
    },
    {
      label: 'Steps',
      value: todayLog?.steps,
      unit: 'steps',
      avg: getAvg('steps'),
      target: 10000,
      icon: Footprints,
      color: 'emerald',
      tip: '10,000 steps is a great daily goal'
    },
    {
      label: 'Water',
      value: todayLog?.water_glasses,
      unit: 'glasses',
      avg: getAvg('water_glasses'),
      target: 8,
      icon: Droplets,
      color: 'blue',
      tip: 'Stay hydrated with 8 glasses per day'
    },
    {
      label: 'Exercise',
      value: todayLog?.exercise_minutes,
      unit: 'min',
      avg: getAvg('exercise_minutes'),
      target: 30,
      icon: Activity,
      color: 'rose',
      tip: '30 minutes of daily activity'
    }
  ];

  const getTrend = (current, avg) => {
    if (!current || !avg) return null;
    const diff = ((current - avg) / avg) * 100;
    if (Math.abs(diff) < 5) return { icon: Minus, color: 'text-slate-400' };
    return diff > 0 
      ? { icon: TrendingUp, color: 'text-emerald-500' }
      : { icon: TrendingDown, color: 'text-rose-500' };
  };

  return (
    <div className="space-y-4">
      {stats.map((stat, i) => {
        const progress = stat.value && stat.target ? Math.min((stat.value / stat.target) * 100, 100) : 0;
        const trend = getTrend(stat.value, stat.avg);
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.tip}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {stat.value != null ? stat.value.toLocaleString() : '-'}
                  <span className="text-sm font-normal text-slate-400 ml-1">{stat.unit}</span>
                </p>
                {stat.avg != null && (
                  <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                    {trend && <trend.icon className={`h-3 w-3 ${trend.color}`} />}
                    Avg: {stat.avg.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`h-full rounded-full bg-${stat.color}-500`}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stat.value != null ? `${Math.round(progress)}% of daily goal (${stat.target} ${stat.unit})` : 'No data logged'}
            </p>
          </motion.div>
        );
      })}

      {/* Sleep Quality */}
      {todayLog?.sleep_quality && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-5"
        >
          <p className="text-sm text-slate-600 mb-2">Sleep Quality</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full ${
                  i < todayLog.sleep_quality ? 'bg-indigo-500' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
          <p className="text-right text-sm font-medium text-indigo-600 mt-1">
            {todayLog.sleep_quality}/10
          </p>
        </motion.div>
      )}
    </div>
  );
}