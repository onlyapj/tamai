import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HabitProgressChart({ habitLogs, habit }) {
  if (!habitLogs || habitLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No data yet. Complete your habit to see progress!</p>
        </CardContent>
      </Card>
    );
  }

  // Last 30 days of data
  const last30Days = habitLogs.slice(-30).map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: log.completed ? 1 : 0,
    count: log.count || 0
  }));

  // Calculate weekly completion
  const weeklyData = [];
  for (let i = 0; i < last30Days.length; i += 7) {
    const week = last30Days.slice(i, i + 7);
    const completedDays = week.filter(d => d.completed).length;
    weeklyData.push({
      week: `Week ${Math.floor(i / 7) + 1}`,
      completion: Math.round((completedDays / 7) * 100)
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">30-Day Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="completion" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}