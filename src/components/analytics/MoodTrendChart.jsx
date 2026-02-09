import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Heart } from 'lucide-react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function MoodTrendChart({ moods, dateRange, detailed = false }) {
  const { start, end } = dateRange;
  
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end)
  });

  const chartData = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMoods = moods.filter(m => m.date === dayStr);
    const avgMood = dayMoods.length > 0 
      ? dayMoods.reduce((sum, m) => sum + m.mood_score, 0) / dayMoods.length
      : null;

    return {
      date: format(day, 'MMM d'),
      mood: avgMood ? Math.round(avgMood * 10) / 10 : null
    };
  }).filter(d => d.mood !== null);

  const allMoods = moods.filter(m => m.date >= start && m.date <= end);
  const avgMood = allMoods.length > 0 
    ? Math.round((allMoods.reduce((sum, m) => sum + m.mood_score, 0) / allMoods.length) * 10) / 10
    : 0;

  const moodEmoji = avgMood >= 8 ? '😊' : avgMood >= 6 ? '🙂' : avgMood >= 4 ? '😐' : '😔';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Mood Trends</h3>
          <p className="text-sm text-slate-500">Your emotional wellbeing</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Heart className="h-5 w-5 text-violet-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-2xl font-bold text-violet-600">{avgMood}/10 {moodEmoji}</p>
          <p className="text-xs text-slate-500">Average Mood</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{allMoods.length}</p>
          <p className="text-xs text-slate-500">Check-ins</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={detailed ? 400 : 250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fill="url(#moodGradient)"
            name="Mood Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}