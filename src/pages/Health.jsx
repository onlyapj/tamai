import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, Moon, Droplets, Dumbbell, Footprints, Weight, Zap, Brain, Heart,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultLog = {
  sleep_hours: '',
  water_intake: '',
  exercise_minutes: '',
  steps: '',
  weight: '',
  energy_level: '',
  stress_level: '',
};

export default function Health() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({ ...defaultLog });

  // Today's log
  const { data: todayLog = [] } = useQuery({
    queryKey: ['health_logs', 'today'],
    queryFn: () => db.filter('health_logs', { date: today }),
  });

  // History for charts
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['health_logs', 'history'],
    queryFn: () => db.list('health_logs', { orderBy: 'date', ascending: true, limit: 30 }),
  });

  const hasLoggedToday = todayLog.length > 0;
  const todayData = hasLoggedToday ? todayLog[0] : null;

  // Create log
  const createLog = useMutation({
    mutationFn: (data) => db.create('health_logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_logs'] });
      toast.success('Health log saved!');
      setForm({ ...defaultLog });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { date: today };
    if (form.sleep_hours) data.sleep_hours = Number(form.sleep_hours);
    if (form.water_intake) data.water_intake = Number(form.water_intake);
    if (form.exercise_minutes) data.exercise_minutes = Number(form.exercise_minutes);
    if (form.steps) data.steps = Number(form.steps);
    if (form.weight) data.weight = Number(form.weight);
    if (form.energy_level) data.energy_level = Number(form.energy_level);
    if (form.stress_level) data.stress_level = Number(form.stress_level);
    createLog.mutate(data);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Chart data
  const chartData = history.map((entry) => ({
    date: format(new Date(entry.date + 'T12:00:00'), 'MMM d'),
    sleep: entry.sleep_hours,
    water: entry.water_intake,
    exercise: entry.exercise_minutes,
    steps: entry.steps,
    energy: entry.energy_level,
    stress: entry.stress_level,
    weight: entry.weight,
  }));

  const todayMetrics = [
    { label: 'Sleep', value: todayData?.sleep_hours, unit: 'hrs', icon: Moon, color: 'text-indigo-600', bg: isDark ? 'bg-indigo-950' : 'bg-indigo-50' },
    { label: 'Water', value: todayData?.water_intake, unit: 'cups', icon: Droplets, color: 'text-blue-600', bg: isDark ? 'bg-blue-950' : 'bg-blue-50' },
    { label: 'Exercise', value: todayData?.exercise_minutes, unit: 'min', icon: Dumbbell, color: 'text-green-600', bg: isDark ? 'bg-green-950' : 'bg-green-50' },
    { label: 'Steps', value: todayData?.steps, unit: '', icon: Footprints, color: 'text-amber-600', bg: isDark ? 'bg-amber-950' : 'bg-amber-50' },
    { label: 'Weight', value: todayData?.weight, unit: 'kg', icon: Weight, color: 'text-purple-600', bg: isDark ? 'bg-purple-950' : 'bg-purple-50' },
    { label: 'Energy', value: todayData?.energy_level, unit: '/10', icon: Zap, color: 'text-orange-600', bg: isDark ? 'bg-orange-950' : 'bg-orange-50' },
    { label: 'Stress', value: todayData?.stress_level, unit: '/10', icon: Brain, color: 'text-red-600', bg: isDark ? 'bg-red-950' : 'bg-red-50' },
  ];

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6')}>
      {/* Header */}
      <div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
          Health Tracking
        </h1>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Monitor your daily health metrics and spot trends
        </p>
      </div>

      {/* Today's Summary or Log Form */}
      {hasLoggedToday ? (
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardHeader>
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Today&apos;s Health Summary
            </CardTitle>
            <CardDescription className={cn(isDark && 'text-slate-400')}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {todayMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className={cn('p-3 rounded-xl text-center', isDark ? 'bg-slate-800' : 'bg-slate-50')}
                >
                  <div className={cn('h-10 w-10 rounded-lg mx-auto mb-2 flex items-center justify-center', metric.bg)}>
                    <metric.icon className={cn('h-5 w-5', metric.color)} />
                  </div>
                  <div className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    {metric.value !== null && metric.value !== undefined ? metric.value : '--'}
                    <span className={cn('text-xs font-normal ml-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {metric.unit}
                    </span>
                  </div>
                  <div className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardHeader>
            <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
              Log Today&apos;s Health
            </CardTitle>
            <CardDescription className={cn(isDark && 'text-slate-400')}>
              Fill in what you can -- all fields are optional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Moon className="h-3.5 w-3.5" /> Sleep (hours)
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="7.5"
                    value={form.sleep_hours}
                    onChange={(e) => handleChange('sleep_hours', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Droplets className="h-3.5 w-3.5" /> Water (cups)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="8"
                    value={form.water_intake}
                    onChange={(e) => handleChange('water_intake', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Dumbbell className="h-3.5 w-3.5" /> Exercise (min)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={form.exercise_minutes}
                    onChange={(e) => handleChange('exercise_minutes', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Footprints className="h-3.5 w-3.5" /> Steps
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={form.steps}
                    onChange={(e) => handleChange('steps', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Weight className="h-3.5 w-3.5" /> Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="70"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                    <Zap className="h-3.5 w-3.5" /> Energy (1-10)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="7"
                    value={form.energy_level}
                    onChange={(e) => handleChange('energy_level', e.target.value)}
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
              </div>
              <div className="space-y-2 max-w-[calc(33.333%-0.667rem)]">
                <Label className={cn('flex items-center gap-1.5', isDark && 'text-slate-300')}>
                  <Brain className="h-3.5 w-3.5" /> Stress (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="4"
                  value={form.stress_level}
                  onChange={(e) => handleChange('stress_level', e.target.value)}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <Button
                type="submit"
                disabled={createLog.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createLog.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Health Log
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trend Charts */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            Health Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : chartData.length === 0 ? (
            <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No health data yet. Log your first entry to see trends!</p>
            </div>
          ) : (
            <Tabs defaultValue="sleep" className="space-y-4">
              <TabsList className={cn(isDark && 'bg-slate-800')}>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="exercise">Exercise</TabsTrigger>
                <TabsTrigger value="energy">Energy/Stress</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
              </TabsList>

              <TabsContent value="sleep">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#fff',
                          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Bar dataKey="sleep" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
                      <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Water (cups)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="exercise">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#fff',
                          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Bar dataKey="exercise" fill="#22c55e" radius={[4, 4, 0, 0]} name="Exercise (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="energy">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <YAxis domain={[1, 10]} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#fff',
                          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="weight">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#fff',
                          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
