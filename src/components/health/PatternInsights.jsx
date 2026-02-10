import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Lightbulb, Calendar } from 'lucide-react';

export default function PatternInsights({ data }) {
  if (!data?.patterns || data.patterns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Insufficient data for pattern analysis. Keep tracking your habits!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Success Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.success_patterns?.map((pattern, idx) => (
            <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-medium text-emerald-900">{pattern.pattern}</p>
              <p className="text-sm text-emerald-700 mt-1">{pattern.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-200 text-emerald-800">
                  {(pattern.success_rate * 100).toFixed(0)}% success
                </Badge>
                <Badge variant="outline" className="text-emerald-700">
                  {pattern.frequency} occurrences
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Failure Patterns & Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Risk Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.failure_patterns?.map((pattern, idx) => (
            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-medium text-amber-900">{pattern.pattern}</p>
              <p className="text-sm text-amber-700 mt-1">{pattern.description}</p>
              <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ {pattern.warning}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-amber-200 text-amber-800">
                  {(pattern.failure_rate * 100).toFixed(0)}% failure
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timing Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Timing Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.timing_patterns?.map((pattern, idx) => (
            <div key={idx} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="font-medium text-indigo-900">{pattern.time_period}</p>
              <p className="text-sm text-indigo-700 mt-1">{pattern.observation}</p>
              <Badge variant="outline" className="mt-2">{pattern.recommendation}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.recommendations?.map((rec, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="font-bold text-indigo-600 flex-shrink-0">{idx + 1}</span>
                <div>
                  <p className="font-medium text-slate-900">{rec.recommendation}</p>
                  <p className="text-sm text-slate-600 mt-1">{rec.rationale}</p>
                  <p className="text-xs text-slate-500 mt-1">Expected impact: {rec.impact}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}