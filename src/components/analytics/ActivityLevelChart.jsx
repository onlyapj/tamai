import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function ActivityLevelChart({ healthLogs, dateRange, detailed = false }) {
  const { start, end } = dateRange;
  
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end)
  });

  const chartData = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const log = healthLogs.find(h => h.date === dayStr);

    return {
      date: format(day, 'MMM d'),
      steps: log?.steps || 0,
      exercise: log?.exercise_minutes || 0,
      sleep: log?.sleep_hours || 0
    };
  });

  const avgSteps = Math.round(chartData.reduce((sum, d) => sum + d.steps, 0) / chartData.length);
  const avgExercise = Math.round(chartData.reduce((sum, d) => sum + d.exercise, 0) / chartData.length);
  const avgSleep = Math.round((chartData.reduce((sum, d) => sum + d.sleep, 0) / chartData.length) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Activity Levels</h3>
          <p className="text-sm text-slate-500">Your daily movement & rest</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <Activity className="h-5 w-5 text-rose-600" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-2xl font-bold text-rose-600">{avgSteps.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Avg Steps</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{avgExercise}m</p>
          <p className="text-xs text-slate-500">Avg Exercise</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-600">{avgSleep}h</p>
          <p className="text-xs text-slate-500">Avg Sleep</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={detailed ? 400 : 250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="exercise" 
            stroke="#f43f5e" 
            strokeWidth={2}
            name="Exercise (min)"
          />
          <Line 
            type="monotone" 
            dataKey="sleep" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Sleep (hrs)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}