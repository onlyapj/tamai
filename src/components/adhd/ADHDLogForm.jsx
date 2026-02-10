import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ADHDLogForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    focus_score: 5,
    symptom_severity: 5,
    distractibility: 5,
    energy_level: 5,
    focus_sessions: [],
    energy_crashes: [],
    medication_taken: false,
    medication_time: '',
    sleep_hours: 8,
    sleep_quality: 5,
    triggers_experienced: [],
    wins: [],
    notes: ''
  });

  const [newSession, setNewSession] = useState({ start_time: '09:00', duration_minutes: 60, task: '', was_hyperfocus: false });
  const [newCrash, setNewCrash] = useState({ time: '15:00', severity: 5 });
  const [newTrigger, setNewTrigger] = useState('');
  const [newWin, setNewWin] = useState('');

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.ADHDLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhd-logs'] });
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        focus_score: 5,
        symptom_severity: 5,
        distractibility: 5,
        energy_level: 5,
        focus_sessions: [],
        energy_crashes: [],
        medication_taken: false,
        medication_time: '',
        sleep_hours: 8,
        sleep_quality: 5,
        triggers_experienced: [],
        wins: [],
        notes: ''
      });
      onSuccess?.();
    }
  });

  const addSession = () => {
    if (newSession.task.trim() && newSession.start_time) {
      setFormData(prev => ({
        ...prev,
        focus_sessions: [...prev.focus_sessions, { ...newSession }]
      }));
      setNewSession({ start_time: '09:00', duration_minutes: 60, task: '', was_hyperfocus: false });
    }
  };

  const addCrash = () => {
    if (newCrash.time) {
      setFormData(prev => ({
        ...prev,
        energy_crashes: [...prev.energy_crashes, { ...newCrash }]
      }));
      setNewCrash({ time: '15:00', severity: 5 });
    }
  };

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setFormData(prev => ({
        ...prev,
        triggers_experienced: [...prev.triggers_experienced, newTrigger.trim()]
      }));
      setNewTrigger('');
    }
  };

  const addWin = () => {
    if (newWin.trim()) {
      setFormData(prev => ({
        ...prev,
        wins: [...prev.wins, newWin.trim()]
      }));
      setNewWin('');
    }
  };

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <Card>
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-200">
          <CardTitle>Log Today's ADHD Data</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Track your focus, energy, symptoms, and wins</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Core Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Focus Score: {formData.focus_score}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.focus_score}
                onChange={(e) => setFormData(prev => ({ ...prev, focus_score: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Symptom Severity: {formData.symptom_severity}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.symptom_severity}
                onChange={(e) => setFormData(prev => ({ ...prev, symptom_severity: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Distractibility: {formData.distractibility}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.distractibility}
                onChange={(e) => setFormData(prev => ({ ...prev, distractibility: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Energy Level: {formData.energy_level}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Sleep */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep_hours">Sleep Hours: {formData.sleep_hours}h</Label>
              <input
                id="sleep_hours"
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Sleep Quality: {formData.sleep_quality}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep_quality}
                onChange={(e) => setFormData(prev => ({ ...prev, sleep_quality: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Medication */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medication_taken"
                checked={formData.medication_taken}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, medication_taken: checked }))}
              />
              <Label htmlFor="medication_taken" className="cursor-pointer">Took medication today</Label>
            </div>
            {formData.medication_taken && (
              <Input
                type="time"
                value={formData.medication_time}
                onChange={(e) => setFormData(prev => ({ ...prev, medication_time: e.target.value }))}
                placeholder="Time taken"
              />
            )}
          </div>

          {/* Focus Sessions */}
          <div className="space-y-3">
            <Label className="font-semibold">Focus Sessions</Label>
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newSession.start_time}
                  onChange={(e) => setNewSession(prev => ({ ...prev, start_time: e.target.value }))}
                  placeholder="Start time"
                />
                <Input
                  type="number"
                  value={newSession.duration_minutes}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  placeholder="Minutes"
                  min="5"
                  max="480"
                  className="w-20"
                />
                <Input
                  value={newSession.task}
                  onChange={(e) => setNewSession(prev => ({ ...prev, task: e.target.value }))}
                  placeholder="What did you work on?"
                />
                <Button onClick={addSession} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="was_hyperfocus"
                  checked={newSession.was_hyperfocus}
                  onCheckedChange={(checked) => setNewSession(prev => ({ ...prev, was_hyperfocus: checked }))}
                />
                <Label htmlFor="was_hyperfocus" className="text-sm cursor-pointer">Was this hyperfocus?</Label>
              </div>
            </div>
            {formData.focus_sessions.length > 0 && (
              <div className="space-y-2">
                {formData.focus_sessions.map((session, i) => (
                  <div key={i} className="p-3 bg-white border border-violet-200 rounded-lg flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{session.task} ({session.start_time})</p>
                      <p className="text-xs text-slate-600">{session.duration_minutes}min {session.was_hyperfocus && '• Hyperfocus'}</p>
                    </div>
                    <button onClick={() => setFormData(prev => ({
                      ...prev,
                      focus_sessions: prev.focus_sessions.filter((_, idx) => idx !== i)
                    }))} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Energy Crashes */}
          <div className="space-y-3">
            <Label className="font-semibold">Energy Crashes</Label>
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newCrash.time}
                  onChange={(e) => setNewCrash(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="Time of crash"
                />
                <div className="flex-1">
                  <Label className="text-xs">Severity: {newCrash.severity}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newCrash.severity}
                    onChange={(e) => setNewCrash(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <Button onClick={addCrash} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {formData.energy_crashes.length > 0 && (
              <div className="space-y-2">
                {formData.energy_crashes.map((crash, i) => (
                  <div key={i} className="p-3 bg-white border border-orange-200 rounded-lg flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{crash.time}</p>
                      <p className="text-xs text-slate-600">Severity: {crash.severity}/10</p>
                    </div>
                    <button onClick={() => setFormData(prev => ({
                      ...prev,
                      energy_crashes: prev.energy_crashes.filter((_, idx) => idx !== i)
                    }))} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Triggers */}
          <div className="space-y-3">
            <Label className="font-semibold">Triggers Experienced</Label>
            <div className="flex gap-2">
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                placeholder="e.g., loud noise, caffeine, sleep deprivation..."
              />
              <Button onClick={addTrigger} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.triggers_experienced.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.triggers_experienced.map((trigger, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                    {trigger}
                    <button onClick={() => setFormData(prev => ({
                      ...prev,
                      triggers_experienced: prev.triggers_experienced.filter((_, idx) => idx !== i)
                    }))} className="font-bold hover:opacity-70">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wins */}
          <div className="space-y-3">
            <Label className="font-semibold">Today's Wins</Label>
            <div className="flex gap-2">
              <Input
                value={newWin}
                onChange={(e) => setNewWin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWin()}
                placeholder="What did you accomplish?"
              />
              <Button onClick={addWin} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.wins.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.wins.map((win, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    {win}
                    <button onClick={() => setFormData(prev => ({
                      ...prev,
                      wins: prev.wins.filter((_, idx) => idx !== i)
                    }))} className="font-bold hover:opacity-70">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other observations about your day?"
              className="h-24"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Today\'s Log'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}