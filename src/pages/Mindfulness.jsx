import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Plus, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import MoodTracker from '@/components/mindfulness/MoodTracker.jsx';
import JournalSection from '@/components/mindfulness/JournalSection.jsx';
import MoodHistory from '@/components/mindfulness/MoodHistory.jsx';

export default function Mindfulness() {
  const [activeTab, setActiveTab] = useState('mood');
  const queryClient = useQueryClient();

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 30)
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date', 20)
  });

  const todayMood = moodEntries.find(m => m.date === format(new Date(), 'yyyy-MM-dd'));

  const tabs = [
    { id: 'mood', label: 'Check-in', icon: Smile },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Mindfulness</span>
          </h1>
          <p className="text-slate-500 mt-1">Track your mood and cultivate inner peace</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/60 p-1.5 rounded-2xl border border-slate-200/60">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg'
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
          {activeTab === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MoodTracker 
                todayMood={todayMood} 
                onUpdate={() => queryClient.invalidateQueries(['moodEntries'])} 
              />
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <JournalSection 
                entries={journalEntries}
                onUpdate={() => queryClient.invalidateQueries(['journalEntries'])}
              />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MoodHistory moodEntries={moodEntries} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}