import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function TaskCompletionChart({ tasks, dateRange, detailed = false }) {
  const { start, end } = dateRange;
  
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end)
  });

  const chartData = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.due_date === dayStr);
    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const total = dayTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      date: format(day, 'MMM d'),
      completed,
      total,
      rate
    };
  });

  const totalTasks = tasks.filter(t => t.due_date >= start && t.due_date <= end).length;
  const completedTasks = tasks.filter(t => t.due_date >= start && t.due_date <= end && t.status === 'completed').length;
  const overallRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Task Completion</h3>
          <p className="text-sm text-slate-500">Your productivity trends</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{overallRate}%</p>
          <p className="text-xs text-slate-500">Completion Rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-600">{totalTasks - completedTasks}</p>
          <p className="text-xs text-slate-500">Pending</p>
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
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#6366f1" 
            strokeWidth={2}
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}