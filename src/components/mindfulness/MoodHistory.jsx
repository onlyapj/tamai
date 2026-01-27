import React from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Smile, Zap, BrainCircuit } from 'lucide-react';

export default function MoodHistory({ moodEntries }) {
  // Prepare chart data (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = moodEntries.find(m => m.date === dateStr);
    return {
      date: format(date, 'MMM d'),
      mood: entry?.mood_score || null,
      energy: entry?.energy_level || null,
      stress: entry?.stress_level || null
    };
  });

  // Calculate averages and trends
  const recentEntries = moodEntries.slice(0, 7);
  const olderEntries = moodEntries.slice(7, 14);

  const getAvg = (entries, field) => {
    const valid = entries.filter(e => e[field]);
    return valid.length ? valid.reduce((sum, e) => sum + e[field], 0) / valid.length : 0;
  };

  const stats = [
    {
      label: 'Avg Mood',
      current: getAvg(recentEntries, 'mood_score'),
      previous: getAvg(olderEntries, 'mood_score'),
      icon: Smile,
      color: 'violet',
      max: 5
    },
    {
      label: 'Avg Energy',
      current: getAvg(recentEntries, 'energy_level'),
      previous: getAvg(olderEntries, 'energy_level'),
      icon: Zap,
      color: 'amber',
      max: 10
    },
    {
      label: 'Avg Stress',
      current: getAvg(recentEntries, 'stress_level'),
      previous: getAvg(olderEntries, 'stress_level'),
      icon: BrainCircuit,
      color: 'rose',
      max: 10,
      invert: true
    }
  ];

  const getTrend = (current, previous, invert = false) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.3) return { icon: Minus, color: 'text-slate-400', text: 'Stable' };
    if (invert) {
      return diff > 0 
        ? { icon: TrendingUp, color: 'text-rose-500', text: 'Higher' }
        : { icon: TrendingDown, color: 'text-emerald-500', text: 'Lower' };
    }
    return diff > 0 
      ? { icon: TrendingUp, color: 'text-emerald-500', text: 'Improving' }
      : { icon: TrendingDown, color: 'text-rose-500', text: 'Declining' };
  };

  // Most common tags
  const tagCounts = {};
  moodEntries.forEach(e => {
    e.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const trend = getTrend(stat.current, stat.previous, stat.invert);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stat.current.toFixed(1)}
                <span className="text-sm text-slate-400">/{stat.max}</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <trend.icon className={`h-3 w-3 ${trend.color}`} />
                <span className={`text-xs ${trend.color}`}>{trend.text}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mood Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Mood Over Time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last14Days}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="mood" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fill="url(#moodGradient)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy & Stress Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Energy & Stress</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last14Days}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-500">Energy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-slate-500">Stress</span>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Common Feelings</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-2 bg-violet-50 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-violet-700">{tag}</span>
                <span className="text-xs text-violet-400">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}