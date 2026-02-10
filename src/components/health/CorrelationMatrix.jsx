import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart } from 'lucide-react';

export default function CorrelationMatrix({ data }) {
  if (!data?.correlations || data.correlations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Need more data to calculate correlations. Keep logging your habits and mood!
        </CardContent>
      </Card>
    );
  }

  // Sort by strength
  const sorted = [...data.correlations].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Habit & Mood Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.habit_name}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.correlation > 0 ? '↑' : '↓'} {item.correlation_type === 'mood' ? 'Mood' : 'Energy'}: {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">{(item.correlation * 100).toFixed(0)}%</p>
                    <p className="text-xs text-slate-500">correlation</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.correlation > 0.5
                        ? 'bg-emerald-100'
                        : item.correlation > 0.3
                        ? 'bg-amber-100'
                        : 'bg-slate-200'
                    }`}
                  >
                    {Math.abs(item.correlation) > 0.5 && <TrendingUp className="h-5 w-5 text-emerald-600" />}
                    {Math.abs(item.correlation) <= 0.5 && <Heart className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habit Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.habit_interactions?.slice(0, 5).map((interaction, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {interaction.habit_a} + {interaction.habit_b}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{interaction.description}</p>
                </div>
                <Badge variant={interaction.boost ? 'default' : 'outline'}>
                  {interaction.boost ? '⬆️ Synergy' : '📊 Track'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}