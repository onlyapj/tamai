import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Sparkles, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const preferences = user?.notification_preferences || {
    tamai_updates: true,
    task_reminders: true,
    system_alerts: true,
    feedback_responses: true,
    admin_alerts: true
  };

  const updateMutation = useMutation({
    mutationFn: (prefs) => base44.auth.updateMe({ notification_preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      toast.success('Preferences saved');
    }
  });

  const togglePref = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    updateMutation.mutate(newPrefs);
  };

  const settings = [
    {
      key: 'tamai_updates',
      icon: Sparkles,
      title: 'TAMAI Updates',
      description: 'Receive notifications from your AI assistant',
      color: 'text-indigo-600'
    },
    {
      key: 'task_reminders',
      icon: CheckCircle2,
      title: 'Task Reminders',
      description: 'Get notified about upcoming tasks and deadlines',
      color: 'text-emerald-600'
    },
    {
      key: 'system_alerts',
      icon: AlertCircle,
      title: 'System Alerts',
      description: 'Important system notifications and updates',
      color: 'text-amber-600'
    },
    {
      key: 'feedback_responses',
      icon: Bell,
      title: 'Feedback Responses',
      description: 'Get notified when your feedback is reviewed',
      color: 'text-blue-600'
    }
  ];

  if (user?.role === 'admin') {
    settings.push({
      key: 'admin_alerts',
      icon: Shield,
      title: 'Admin Alerts',
      description: 'Critical alerts for administrators',
      color: 'text-red-600'
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Notification Settings</h1>
              <p className="text-slate-600">Manage how you receive notifications</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {settings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div key={setting.key} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${setting.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{setting.title}</h3>
                      <p className="text-sm text-slate-600">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[setting.key]}
                    onCheckedChange={() => togglePref(setting.key)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
              <p className="text-sm text-blue-700">
                Notifications help you stay updated with important events and reminders. 
                You can customize which types you want to receive above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}