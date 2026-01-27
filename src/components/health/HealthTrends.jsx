import React from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Moon, Footprints, Droplets, Activity } from 'lucide-react';

export default function HealthTrends({ healthLogs }) {
  // Prepare chart data (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = healthLogs.find(l => l.date === dateStr);
    return {
      date: format(date, 'MMM d'),
      sleep: log?.sleep_hours || null,
      steps: log?.steps || null,
      water: log?.water_glasses || null,
      exercise: log?.exercise_minutes || null
    };
  });

  const charts = [
    { key: 'sleep', label: 'Sleep Hours', icon: Moon, color: '#6366f1', gradient: 'sleepGradient' },
    { key: 'steps', label: 'Daily Steps', icon: Footprints, color: '#10b981', gradient: 'stepsGradient' },
    { key: 'water', label: 'Water Intake', icon: Droplets, color: '#3b82f6', gradient: 'waterGradient' },
    { key: 'exercise', label: 'Exercise Minutes', icon: Activity, color: '#f43f5e', gradient: 'exerciseGradient' }
  ];

  return (
    <div className="space-y-6">
      {charts.map((chart, i) => (
        <motion.div
          key={chart.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <chart.icon className="h-5 w-5" style={{ color: chart.color }} />
            <h3 className="font-semibold text-slate-800">{chart.label}</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last14Days}>
                <defs>
                  <linearGradient id={chart.gradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chart.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey={chart.key} 
                  stroke={chart.color} 
                  strokeWidth={2}
                  fill={`url(#${chart.gradient})`}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ))}

      {/* Summary Stats */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">14-Day Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {charts.map(chart => {
            const values = last14Days.map(d => d[chart.key]).filter(v => v != null);
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const daysLogged = values.length;
            
            return (
              <div key={chart.key} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <chart.icon className="h-4 w-4" style={{ color: chart.color }} />
                  <span className="text-xs text-slate-500">{chart.label}</span>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {avg > 0 ? (chart.key === 'steps' ? Math.round(avg).toLocaleString() : avg.toFixed(1)) : '-'}
                </p>
                <p className="text-xs text-slate-400">{daysLogged}/14 days logged</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}