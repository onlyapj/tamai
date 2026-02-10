import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Activity, Moon, Droplets, Footprints, Plus, Target, Flame } from 'lucide-react';
import HealthStats from '@/components/health/HealthStats.jsx';
import HabitTracker from '@/components/health/HabitTracker.jsx';
import HealthLogForm from '@/components/health/HealthLogForm.jsx';
import HealthTrends from '@/components/health/HealthTrends.jsx';
import HabitAnalyticsDashboard from '@/components/health/HabitAnalyticsDashboard.jsx';
import CoachingDashboard from '@/components/health/CoachingDashboard.jsx';

export default function Health() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['healthLogs'],
    queryFn: () => base44.entities.HealthLog.list('-date', 30)
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.filter({ active: true })
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ['habitLogs'],
    queryFn: () => base44.entities.HabitLog.list('-date', 100)
  });

  const todayLog = healthLogs.find(l => l.date === today);
  const todayHabitLogs = habitLogs.filter(l => l.date === today);

  const createHealthLog = useMutation({
    mutationFn: (data) => todayLog 
      ? base44.entities.HealthLog.update(todayLog.id, data)
      : base44.entities.HealthLog.create({ ...data, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
      setShowLogForm(false);
    }
  });

  const tabs = [
    { id: 'coaching', label: 'Coach', icon: Sparkles },
    { id: 'today', label: 'Today', icon: Activity },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'trends', label: 'Trends', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">Health</span>
            </h1>
            <p className="text-slate-500 mt-1">Track wellness & build healthy habits</p>
          </div>
          <Button 
            onClick={() => setShowLogForm(true)}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Moon, label: 'Sleep', value: todayLog?.sleep_hours ? `${todayLog.sleep_hours}h` : '-', color: 'text-indigo-600' },
            { icon: Footprints, label: 'Steps', value: todayLog?.steps?.toLocaleString() || '-', color: 'text-emerald-600' },
            { icon: Droplets, label: 'Water', value: todayLog?.water_glasses ? `${todayLog.water_glasses}` : '-', color: 'text-blue-600' },
            { icon: Activity, label: 'Exercise', value: todayLog?.exercise_minutes ? `${todayLog.exercise_minutes}m` : '-', color: 'text-rose-600' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-3 border border-slate-200 text-center"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/60 p-1.5 rounded-2xl border border-slate-200/60">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'coaching' && (
            <motion.div key="coaching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CoachingDashboard />
            </motion.div>
          )}
          {activeTab === 'today' && (
            <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HealthStats todayLog={todayLog} healthLogs={healthLogs} />
            </motion.div>
          )}
          {activeTab === 'habits' && (
            <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HabitTracker 
                habits={habits} 
                habitLogs={habitLogs}
                todayLogs={todayHabitLogs}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['habitLogs', 'habits'] })}
              />
            </motion.div>
          )}
          {activeTab === 'trends' && (
            <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HealthTrends healthLogs={healthLogs} />
            </motion.div>
          )}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HabitAnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Log Form Modal */}
        <AnimatePresence>
          {showLogForm && (
            <HealthLogForm
              existingLog={todayLog}
              onSubmit={(data) => createHealthLog.mutate(data)}
              onCancel={() => setShowLogForm(false)}
              isLoading={createHealthLog.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}