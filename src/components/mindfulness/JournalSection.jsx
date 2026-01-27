import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Sun, Moon, Heart, Lightbulb, X, Trash2 } from 'lucide-react';

const journalTypes = [
  { id: 'morning', label: 'Morning', icon: Sun, color: 'bg-amber-100 text-amber-700' },
  { id: 'evening', label: 'Evening', icon: Moon, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { id: 'reflection', label: 'Reflection', icon: Lightbulb, color: 'bg-violet-100 text-violet-700' }
];

export default function JournalSection({ entries, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('reflection');
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const queryClient = useQueryClient();

  const createEntry = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['journalEntries']);
      setShowForm(false);
      setContent('');
      setGratitude(['', '', '']);
      onUpdate?.();
    }
  });

  const deleteEntry = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['journalEntries']);
      onUpdate?.();
    }
  });

  const handleSave = () => {
    const data = {
      type,
      content,
      date: format(new Date(), 'yyyy-MM-dd'),
      gratitude: type === 'gratitude' ? gratitude.filter(g => g.trim()) : undefined
    };
    createEntry.mutate(data);
  };

  return (
    <div className="space-y-4">
      {/* New Entry Button */}
      {!showForm && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all"
        >
          <Plus className="h-8 w-8 text-violet-400 mx-auto mb-2" />
          <p className="font-medium text-slate-600">Write a new entry</p>
        </motion.button>
      )}

      {/* Journal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">New Journal Entry</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Type Selection */}
            <div className="flex gap-2 mb-4">
              {journalTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    type === t.id ? t.color : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Gratitude List */}
            {type === 'gratitude' && (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-500">Three things I'm grateful for:</p>
                {gratitude.map((g, i) => (
                  <Input
                    key={i}
                    value={g}
                    onChange={(e) => {
                      const newGratitude = [...gratitude];
                      newGratitude[i] = e.target.value;
                      setGratitude(newGratitude);
                    }}
                    placeholder={`${i + 1}. I'm grateful for...`}
                    className="border-slate-200"
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'morning' ? "What are my intentions for today?" 
                : type === 'evening' ? "How did today go? What did I learn?"
                : "Write your thoughts..."}
              className="resize-none h-32 border-slate-200 mb-4"
            />

            <Button
              onClick={handleSave}
              disabled={!content.trim() || createEntry.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {createEntry.isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Entries */}
      <div className="space-y-3">
        {entries.map((entry, i) => {
          const typeInfo = journalTypes.find(t => t.id === entry.type) || journalTypes[3];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${typeInfo.color}`}>
                    <typeInfo.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs text-slate-500">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-500"
                  onClick={() => deleteEntry.mutate(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {entry.gratitude?.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {entry.gratitude.map((g, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <Heart className="h-3.5 w-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.content}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}