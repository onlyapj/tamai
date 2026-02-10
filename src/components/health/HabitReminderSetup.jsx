import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
];

export default function HabitReminderSetup({ habit, onUpdate, isLoading }) {
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminder_enabled || false);
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || '09:00');
  const [selectedDays, setSelectedDays] = useState(habit?.reminder_days || [1, 2, 3, 4, 5]);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    await onUpdate({
      reminder_enabled: reminderEnabled,
      reminder_time: reminderTime,
      reminder_days: selectedDays
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Enable Reminders</Label>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
          />
        </div>

        {reminderEnabled && (
          <>
            <div>
              <Label htmlFor="time" className="block mb-2">Reminder Time</Label>
              <input
                id="time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <Label className="block mb-3">Reminder Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedDays.includes(day.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            'Save Reminders'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}