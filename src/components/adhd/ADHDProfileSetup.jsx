import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brain, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ADHDProfileSetup() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    has_adhd: false,
    adhd_type: 'combined',
    is_medicated: false,
    medication_name: '',
    medication_dosage: '',
    typical_focus_window: 45,
    energy_crash_time: '15:00',
    hyperfocus_triggers: [],
    distraction_triggers: [],
    best_productivity_time: 'morning',
    preferred_break_activities: [],
    diagnosis_date: ''
  });

  const [newTrigger, setNewTrigger] = useState('');
  const [newBreakActivity, setNewBreakActivity] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['adhd-profile'],
    queryFn: async () => {
      const profiles = await base44.asServiceRole.entities.ADHDProfile.list();
      const userProfile = profiles.find(p => p.created_by === (await base44.auth.me()).email);
      return userProfile;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        await base44.asServiceRole.entities.ADHDProfile.update(profile.id, data);
      } else {
        await base44.asServiceRole.entities.ADHDProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhd-profile'] });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addTrigger = (type) => {
    if (type === 'hyperfocus' && newTrigger.trim()) {
      setFormData(prev => ({
        ...prev,
        hyperfocus_triggers: [...prev.hyperfocus_triggers, newTrigger.trim()]
      }));
      setNewTrigger('');
    } else if (type === 'distraction' && newTrigger.trim()) {
      setFormData(prev => ({
        ...prev,
        distraction_triggers: [...prev.distraction_triggers, newTrigger.trim()]
      }));
      setNewTrigger('');
    }
  };

  const addBreakActivity = () => {
    if (newBreakActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        preferred_break_activities: [...prev.preferred_break_activities, newBreakActivity.trim()]
      }));
      setNewBreakActivity('');
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <Card>
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-200">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-600" />
            ADHD Profile Setup
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Help us understand your ADHD to personalize your experience</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* ADHD Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_adhd"
              checked={formData.has_adhd}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_adhd: checked }))}
            />
            <Label htmlFor="has_adhd" className="font-medium cursor-pointer">I have been diagnosed with ADHD</Label>
          </div>

          {formData.has_adhd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              {/* ADHD Type */}
              <div className="space-y-2">
                <Label htmlFor="adhd_type">ADHD Type</Label>
                <Select value={formData.adhd_type} onValueChange={(val) => setFormData(prev => ({ ...prev, adhd_type: val }))}>
                  <SelectTrigger id="adhd_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inattentive">Inattentive Type</SelectItem>
                    <SelectItem value="hyperactive">Hyperactive Type</SelectItem>
                    <SelectItem value="combined">Combined Type</SelectItem>
                    <SelectItem value="unspecified">Unspecified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Medication */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_medicated"
                  checked={formData.is_medicated}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_medicated: checked }))}
                />
                <Label htmlFor="is_medicated" className="font-medium cursor-pointer">I'm currently taking ADHD medication</Label>
              </div>

              {formData.is_medicated && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <Input
                    placeholder="Medication name (e.g., Adderall, Ritalin)"
                    value={formData.medication_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Dosage (e.g., 20mg)"
                    value={formData.medication_dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, medication_dosage: e.target.value }))}
                  />
                </motion.div>
              )}

              {/* Diagnosis Date */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis_date">Diagnosis Date (optional)</Label>
                <Input
                  id="diagnosis_date"
                  type="date"
                  value={formData.diagnosis_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis_date: e.target.value }))}
                />
              </div>

              {/* Focus Window */}
              <div className="space-y-2">
                <Label>Typical Focus Window: {formData.typical_focus_window} minutes</Label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={formData.typical_focus_window}
                  onChange={(e) => setFormData(prev => ({ ...prev, typical_focus_window: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Energy Crash Time */}
              <div className="space-y-2">
                <Label htmlFor="energy_crash_time">Typical Energy Crash Time</Label>
                <Input
                  id="energy_crash_time"
                  type="time"
                  value={formData.energy_crash_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, energy_crash_time: e.target.value }))}
                />
              </div>

              {/* Best Productivity Time */}
              <div className="space-y-2">
                <Label htmlFor="best_productivity_time">Best Productivity Time</Label>
                <Select value={formData.best_productivity_time} onValueChange={(val) => setFormData(prev => ({ ...prev, best_productivity_time: val }))}>
                  <SelectTrigger id="best_productivity_time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6am-12pm)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                    <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                    <SelectItem value="night">Night (9pm+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hyperfocus Triggers */}
              <div className="space-y-2">
                <Label>Hyperfocus Triggers</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., music, video games, writing..."
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrigger('hyperfocus')}
                  />
                  <Button onClick={() => addTrigger('hyperfocus')} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hyperfocus_triggers.map((trigger, i) => (
                    <div key={i} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {trigger}
                      <button onClick={() => setFormData(prev => ({
                        ...prev,
                        hyperfocus_triggers: prev.hyperfocus_triggers.filter((_, idx) => idx !== i)
                      }))} className="font-bold">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Break Activities */}
              <div className="space-y-2">
                <Label>Preferred Break Activities</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., walk, stretch, snack..."
                    value={newBreakActivity}
                    onChange={(e) => setNewBreakActivity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addBreakActivity()}
                  />
                  <Button onClick={addBreakActivity} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_break_activities.map((activity, i) => (
                    <div key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {activity}
                      <button onClick={() => setFormData(prev => ({
                        ...prev,
                        preferred_break_activities: prev.preferred_break_activities.filter((_, idx) => idx !== i)
                      }))} className="font-bold">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}