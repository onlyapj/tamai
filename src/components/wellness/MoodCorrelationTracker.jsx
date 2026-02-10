import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Heart, Activity, Moon, Zap } from 'lucide-react';

const ACTIVITY_OPTIONS = [
  'Exercise', 'Meditation', 'Socializing', 'Work', 'Rest', 'Outdoor Time', 'Creative Work', 'Learning'
];

export default function MoodCorrelationTracker() {
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayEntry } = useQuery({
    queryKey: ['mood-today'],
    queryFn: async () => {
      const entries = await base44.entities.MoodEntry.filter({ date: today });
      return entries[0];
    }
  });

  const { data: correlations } = useQuery({
    queryKey: ['mood-correlations'],
    queryFn: async () => {
      const entries = await base44.entities.MoodEntry.list('-date', 30);
      // Calculate activity-mood correlation
      const activityMoods = {};
      entries.forEach(entry => {
        if (entry.activities) {
          entry.activities.forEach(activity => {
            if (!activityMoods[activity]) activityMoods[activity] = [];
            activityMoods[activity].push(entry.mood_score);
          });
        }
      });

      const avgByActivity = {};
      Object.keys(activityMoods).forEach(activity => {
        const scores = activityMoods[activity];
        avgByActivity[activity] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
      });
      return avgByActivity;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create({
      ...data,
      date: today
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-today', 'mood-correlations'] });
      setMoodScore(5);
      setEnergyLevel(5);
      setStressLevel(5);
      setSelectedActivities([]);
      setNotes('');
    }
  });

  const handleActivityToggle = (activity) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = () => {
    createMutation.mutate({
      mood_score: moodScore,
      energy_level: energyLevel,
      stress_level: stressLevel,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      activities: selectedActivities,
      notes: notes || undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600" />
            Today's Mood Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">How are you feeling?</Label>
              <span className="text-2xl font-bold text-indigo-600">{moodScore}</span>
            </div>
            <Slider
              value={[moodScore]}
              onValueChange={([val]) => setMoodScore(val)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Energy & Stress */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2"><Zap className="h-4 w-4" /> Energy Level</Label>
                <span className="font-semibold">{energyLevel}</span>
              </div>
              <Slider
                value={[energyLevel]}
                onValueChange={([val]) => setEnergyLevel(val)}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2"><Activity className="h-4 w-4" /> Stress Level</Label>
                <span className="font-semibold">{stressLevel}</span>
              </div>
              <Slider
                value={[stressLevel]}
                onValueChange={([val]) => setStressLevel(val)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Sleep Data */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="flex items-center gap-2 mb-3"><Moon className="h-4 w-4" /> Sleep Hours</Label>
              <Slider
                value={[sleepHours]}
                onValueChange={([val]) => setSleepHours(val)}
                min={0}
                max={12}
                step={0.5}
              />
              <span className="text-sm text-slate-600 mt-1">{sleepHours} hours</span>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-3"><Moon className="h-4 w-4" /> Sleep Quality</Label>
              <Slider
                value={[sleepQuality]}
                onValueChange={([val]) => setSleepQuality(val)}
                min={1}
                max={10}
                step={1}
              />
              <span className="text-sm text-slate-600 mt-1">{sleepQuality}/10</span>
            </div>
          </div>

          {/* Activities */}
          <div>
            <Label className="block mb-3 font-medium">What activities did you do today?</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <button
                  key={activity}
                  onClick={() => handleActivityToggle(activity)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedActivities.includes(activity)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 block">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How was your day? Any observations about your mood?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Check-in'}
          </Button>
        </CardContent>
      </Card>

      {/* Activity Correlations */}
      {correlations && Object.keys(correlations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity-Mood Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Average mood score when doing each activity (last 30 days)</p>
            <div className="space-y-3">
              {Object.entries(correlations)
                .sort(([, a], [, b]) => b - a)
                .map(([activity, avgMood]) => (
                  <div key={activity} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{activity}</p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                          style={{ width: `${(avgMood / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-indigo-600 w-12 text-right">{avgMood}/10</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}