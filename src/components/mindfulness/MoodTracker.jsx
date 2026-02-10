import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Zap, Battery, BrainCircuit, Check } from 'lucide-react';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Low' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' }
];

const moodTags = ['grateful', 'anxious', 'productive', 'tired', 'calm', 'stressed', 'happy', 'motivated', 'lonely', 'loved'];

export default function MoodTracker({ todayMood, onUpdate }) {
  const [mood, setMood] = useState(todayMood?.mood_score || 3);
  const [energy, setEnergy] = useState(todayMood?.energy_level || 5);
  const [stress, setStress] = useState(todayMood?.stress_level || 5);
  const [notes, setNotes] = useState(todayMood?.notes || '');
  const [selectedTags, setSelectedTags] = useState(todayMood?.tags || []);
  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();

  // Sync state with todayMood prop when it changes
  React.useEffect(() => {
    if (todayMood) {
      setMood(todayMood.mood_score || 3);
      setEnergy(todayMood.energy_level || 5);
      setStress(todayMood.stress_level || 5);
      setNotes(todayMood.notes || '');
      setSelectedTags(todayMood.tags || []);
    }
  }, [todayMood?.id]);

  const saveMood = useMutation({
    mutationFn: async (data) => {
      if (todayMood) {
        return base44.entities.MoodEntry.update(todayMood.id, data);
      }
      return base44.entities.MoodEntry.create({ ...data, date: format(new Date(), 'yyyy-MM-dd') });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moodEntries']);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate?.();
    }
  });

  const handleSave = () => {
    saveMood.mutate({
      mood_score: mood,
      energy_level: energy,
      stress_level: stress,
      notes,
      tags: selectedTags
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">How are you feeling?</h3>
        <div className="flex justify-between items-center">
          {moodEmojis.map((m, i) => (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                mood === m.value 
                  ? 'bg-violet-100 ring-2 ring-violet-400' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs text-slate-500">{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Energy & Stress */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Energy Level</h3>
            <span className="ml-auto text-lg font-bold text-amber-600">{energy}/10</span>
          </div>
          <Slider
            value={[energy]}
            onValueChange={([val]) => setEnergy(val)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold text-slate-800">Stress Level</h3>
            <span className="ml-auto text-lg font-bold text-rose-600">{stress}/10</span>
          </div>
          <Slider
            value={[stress]}
            onValueChange={([val]) => setStress(val)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">What describes your mood?</h3>
        <div className="flex flex-wrap gap-2">
          {moodTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Any thoughts to add?</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write about your day..."
          className="resize-none h-24 border-slate-200"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saveMood.isPending}
        className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-base rounded-2xl"
      >
        {saved ? (
          <><Check className="h-5 w-5 mr-2" /> Saved!</>
        ) : saveMood.isPending ? (
          'Saving...'
        ) : todayMood ? (
          'Update Check-in'
        ) : (
          'Save Check-in'
        )}
      </Button>
    </div>
  );
}