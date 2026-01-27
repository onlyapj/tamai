import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { X, Moon, Footprints, Droplets, Activity } from 'lucide-react';

export default function HealthLogForm({ existingLog, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    sleep_hours: existingLog?.sleep_hours || '',
    sleep_quality: existingLog?.sleep_quality || 5,
    steps: existingLog?.steps || '',
    water_glasses: existingLog?.water_glasses || '',
    exercise_minutes: existingLog?.exercise_minutes || '',
    exercise_type: existingLog?.exercise_type || '',
    weight: existingLog?.weight || '',
    notes: existingLog?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        data[key] = typeof value === 'string' && !isNaN(value) && value !== '' 
          ? parseFloat(value) 
          : value;
      }
    });
    onSubmit(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Log Today's Health</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sleep */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Sleep</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Hours slept</Label>
                <Input
                  type="number"
                  value={form.sleep_hours}
                  onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
                  placeholder="8"
                  step="0.5"
                  min="0"
                  max="24"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Quality ({form.sleep_quality}/10)</Label>
                <Slider
                  value={[form.sleep_quality]}
                  onValueChange={([val]) => setForm({ ...form, sleep_quality: val })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-3"
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <Footprints className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Steps</span>
            </div>
            <Input
              type="number"
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
              placeholder="10000"
              min="0"
            />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Water (glasses)</span>
            </div>
            <div className="flex gap-2">
              {[4, 6, 8, 10, 12].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, water_glasses: n })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.water_glasses === n 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity className="h-4 w-4 text-rose-500" />
              <span className="font-medium">Exercise</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Minutes</Label>
                <Input
                  type="number"
                  value={form.exercise_minutes}
                  onChange={(e) => setForm({ ...form, exercise_minutes: e.target.value })}
                  placeholder="30"
                  min="0"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Type</Label>
                <Input
                  value={form.exercise_type}
                  onChange={(e) => setForm({ ...form, exercise_type: e.target.value })}
                  placeholder="Running, yoga..."
                />
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <Label className="text-xs text-slate-500">Weight (optional)</Label>
            <Input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="kg or lbs"
              step="0.1"
              min="0"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-slate-500">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="How do you feel today?"
              className="resize-none h-20"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-rose-600 hover:bg-rose-700">
              {isLoading ? 'Saving...' : existingLog ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}