import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Plus, BookOpen, Smile } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const moodEmojis = ['', '\ud83d\ude2b', '\ud83d\ude1e', '\ud83d\ude14', '\ud83d\ude15', '\ud83d\ude10', '\ud83d\ude42', '\ud83d\ude0a', '\ud83d\ude04', '\ud83d\ude03', '\ud83e\udd29'];
const moodLabels = ['', 'Terrible', 'Very Bad', 'Bad', 'Down', 'Neutral', 'Okay', 'Good', 'Great', 'Excellent', 'Amazing'];

export default function Mood() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalForm, setJournalForm] = useState({ title: '', content: '' });

  // Today's mood entry
  const { data: todayMood = [] } = useQuery({
    queryKey: ['mood_entries', 'today'],
    queryFn: () => db.filter('mood_entries', { date: today }),
  });

  // Last 30 days of mood entries for chart
  const { data: moodHistory = [], isLoading: moodLoading } = useQuery({
    queryKey: ['mood_entries', 'history'],
    queryFn: () => db.list('mood_entries', { orderBy: 'date', ascending: true, limit: 30 }),
  });

  // Journal entries
  const { data: journals = [], isLoading: journalLoading } = useQuery({
    queryKey: ['journal_entries'],
    queryFn: () => db.list('journal_entries', { orderBy: 'date', ascending: false, limit: 20 }),
  });

  const hasLoggedToday = todayMood.length > 0;

  // Log mood
  const logMood = useMutation({
    mutationFn: (data) => db.create('mood_entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood_entries'] });
      toast.success('Mood logged!');
      setSelectedMood(null);
      setMoodNotes('');
    },
    onError: (err) => toast.error(err.message),
  });

  // Create journal entry
  const createJournal = useMutation({
    mutationFn: (data) => db.create('journal_entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      toast.success('Journal entry saved!');
      setJournalForm({ title: '', content: '' });
      setJournalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleLogMood = () => {
    if (!selectedMood) {
      toast.error('Please select a mood score.');
      return;
    }
    logMood.mutate({ mood_score: selectedMood, date: today, notes: moodNotes });
  };

  const handleCreateJournal = (e) => {
    e.preventDefault();
    if (!journalForm.content.trim()) return;
    createJournal.mutate({
      title: journalForm.title || 'Untitled',
      content: journalForm.content,
      date: today,
    });
  };

  // Chart data
  const chartData = moodHistory.map((entry) => ({
    date: format(new Date(entry.date + 'T12:00:00'), 'MMM d'),
    score: entry.mood_score,
  }));

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6')}>
      {/* Header */}
      <div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
          Mood & Mindfulness
        </h1>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Track how you feel and reflect on your day
        </p>
      </div>

      {/* Mood Logger */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            {hasLoggedToday ? "Today's Mood" : 'How are you feeling?'}
          </CardTitle>
          <CardDescription className={cn(isDark && 'text-slate-400')}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLoggedToday ? (
            <div className="text-center py-4">
              <div className="text-6xl mb-3">{moodEmojis[todayMood[0].mood_score]}</div>
              <div className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                {moodLabels[todayMood[0].mood_score]}
              </div>
              <div className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Score: {todayMood[0].mood_score}/10
              </div>
              {todayMood[0].notes && (
                <p className={cn('mt-3 text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {todayMood[0].notes}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood Score Selector */}
              <div>
                <Label className={cn('mb-3 block', isDark ? 'text-slate-300' : 'text-slate-700')}>
                  Select your mood {selectedMood ? `- ${moodLabels[selectedMood]} ${moodEmojis[selectedMood]}` : ''}
                </Label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSelectedMood(score)}
                      className={cn(
                        'h-14 w-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-2',
                        selectedMood === score
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 scale-110 shadow-lg'
                          : isDark
                            ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <span className="text-lg">{moodEmojis[score]}</span>
                      <span className={cn('text-[10px] font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {score}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>
                  Notes (optional)
                </Label>
                <Textarea
                  placeholder="What's on your mind?"
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  rows={3}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>

              <Button
                onClick={handleLogMood}
                disabled={!selectedMood || logMood.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {logMood.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Log Mood
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Chart */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            Mood History
          </CardTitle>
          <CardDescription className={cn(isDark && 'text-slate-400')}>
            Your mood trends over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moodLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : chartData.length === 0 ? (
            <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
              <Smile className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No mood data yet. Start logging to see trends!</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 10]}
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Section */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Journal
            </CardTitle>
            <CardDescription className={cn(isDark && 'text-slate-400')}>
              Write down your thoughts and reflections
            </CardDescription>
          </div>
          <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-1" /> New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
              <DialogHeader>
                <DialogTitle className={cn(isDark && 'text-white')}>New Journal Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJournal} className="space-y-4">
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Title (optional)</Label>
                  <Input
                    placeholder="Give your entry a title"
                    value={journalForm.title}
                    onChange={(e) => setJournalForm((prev) => ({ ...prev, title: e.target.value }))}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Content</Label>
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={journalForm.content}
                    onChange={(e) => setJournalForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={createJournal.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {createJournal.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Entry
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {journalLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : journals.length === 0 ? (
            <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No journal entries yet. Start writing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'p-4 rounded-lg',
                    isDark ? 'bg-slate-800' : 'bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={cn('font-medium text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                      {entry.title || 'Untitled'}
                    </h4>
                    <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                      {format(new Date(entry.date + 'T12:00:00'), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {entry.content?.length > 200 ? entry.content.slice(0, 200) + '...' : entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
