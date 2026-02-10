import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Calendar, ListTodo, Sparkles, ChevronRight, Heart, Wallet, Activity, Target, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import ChatInterface from '../components/chat/ChatInterface';
import DayTimeline from '../components/dashboard/DayTimeline';
import TopPriorities from '../components/dashboard/TopPriorities';
import DailyReflection from '../components/dashboard/DailyReflection';
import TamaiLogo from '../components/common/TamaiLogo';
import BudgetOverviewWidget from '../components/finance/BudgetOverviewWidget';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import CoachingDashboard from '../components/health/CoachingDashboard';
import ADHDQuickLog from '../components/adhd/ADHDQuickLog';
import ADHDTaskView from '../components/adhd/ADHDTaskView';
import ADHDFocusBooster from '../components/adhd/ADHDFocusBooster';

export default function Home() {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTab, setActiveTab] = useState('today');
    const [showChat, setShowChat] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showFocusBooster, setShowFocusBooster] = useState(false);
    const [boosterTrigger, setBoosterTrigger] = useState(null);
    const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const handleSubmit = (data) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggle = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({ id: task.id, data: { ...task, status: newStatus } });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    await base44.auth.updateMe({ tutorial_completed: true });
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
    const currentHour = new Date().getHours();
    const reflectionType = currentHour < 12 ? 'morning' : 'evening';
    const currentMonth = format(new Date(), 'yyyy-MM');
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: todayMood } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const entries = await base44.entities.MoodEntry.filter({ date: todayStr });
      return entries[0] || null;
    }
  });

  // Check for ADHD profile and recent logs
  const { data: adhdProfile } = useQuery({
    queryKey: ['adhd-profile'],
    queryFn: async () => {
      const profiles = await base44.asServiceRole.entities.ADHDProfile.list();
      const user_ = await base44.auth.me();
      return profiles.find(p => p.created_by === user_.email);
    }
  });

  const { data: todayADHDLog } = useQuery({
    queryKey: ['today-adhd-log'],
    queryFn: async () => {
      const logs = await base44.entities.ADHDLog.filter({ date: todayStr });
      return logs[0] || null;
    },
    enabled: !!adhdProfile?.has_adhd
  });

  // Show tutorial on first login
  useEffect(() => {
    if (user && !user.tutorial_completed) {
      setShowTutorial(true);
    }
  }, [user]);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-month'],
    queryFn: async () => {
      const all = await base44.entities.Transaction.list('-date', 100);
      return all.filter(t => t.date?.startsWith(currentMonth));
    }
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets-month'],
    queryFn: () => base44.entities.Budget.filter({ month: currentMonth })
  });
  
  const filteredTasks = {
    today: tasks.filter(t => t.due_date === todayStr && t.status !== 'completed'),
    upcoming: tasks.filter(t => t.due_date && t.due_date > todayStr && t.status !== 'completed'),
    all: tasks.filter(t => t.status !== 'completed'),
    completed: tasks.filter(t => t.status === 'completed')
  }[activeTab] || [];

  return (
        <div className="min-h-screen bg-slate-50">
          {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
          {showFocusBooster && boosterTrigger && (
            <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
              <ADHDFocusBooster
                energyLevel={boosterTrigger.energy_level}
                symptomSeverity={boosterTrigger.symptom_severity}
                onClose={() => setShowFocusBooster(false)}
              />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <TamaiLogo size="md" />
            <p className="text-slate-500 mt-2">
              {format(new Date(), 'EEEE, MMMM d')} • Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
            </p>
          </div>
          <div className="flex gap-3">
            <a 
              href={base44.agents.getWhatsAppConnectURL('TAMAI')} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>
            <Button
              onClick={() => setShowChat(!showChat)}
              variant={showChat ? "default" : "outline"}
              className={showChat ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button onClick={() => { setEditingTask(null); setShowForm(true); }} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Quick Access Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { name: 'Mindfulness', icon: Heart, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
            { name: 'Finance', icon: Wallet, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
            { name: 'Health', icon: Activity, color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50' },
            { name: 'Goals', icon: Target, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50' }
          ].map((pillar, i) => (
            <Link 
              key={pillar.name}
              to={createPageUrl(pillar.name)}
              className={`group ${pillar.bg} rounded-2xl p-4 border border-slate-200/60 hover:shadow-md transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-2`}>
                <pillar.icon className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-slate-800">{pillar.name}</p>
              <div className="flex items-center text-xs text-slate-500 mt-1 group-hover:text-slate-700">
                Open <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Daily Reflection - Mood Check-in */}
        {!todayMood && (
          <DailyReflection 
            type={reflectionType}
            existingEntry={todayMood}
            onComplete={() => queryClient.invalidateQueries(['todayMood'])}
          />
        )}

        {/* Coaching Insight Widget */}
        <div className="mb-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Weekly Coaching</h3>
            <CoachingDashboard />
          </div>
        </div>

        {/* Quick Insights Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <TopPriorities 
            tasks={tasks.filter(t => t.due_date === todayStr)} 
            onToggle={handleToggle}
          />
          <BudgetOverviewWidget 
            budgets={budgets}
            transactions={transactions}
            currencySymbol="£"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks Panel */}
          <div className={showChat ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="p-4 border-b border-slate-100">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-100/80 p-1">
                    <TabsTrigger value="today" className="data-[state=active]:bg-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Today
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-white">
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                      <ListTodo className="h-4 w-4 mr-2" />
                      All
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white text-emerald-600">
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Form */}
              <AnimatePresence>
                {showForm && (
                  <div className="p-4 border-b border-slate-100">
                    <TaskForm
                      task={editingTask}
                      onSubmit={handleSubmit}
                      onCancel={() => { setShowForm(false); setEditingTask(null); }}
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Task List */}
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : adhdProfile?.has_adhd ? (
                  <div className="space-y-3">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <ADHDTaskView
                          key={task.id}
                          task={task}
                          onToggle={handleToggle}
                          onEdit={handleEdit}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        {activeTab === 'today' ? "No tasks for today" :
                        activeTab === 'upcoming' ? "No upcoming tasks" :
                        activeTab === 'completed' ? "No completed tasks yet" :
                        "No tasks yet"}
                      </div>
                    )}
                  </div>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onToggle={handleToggle}
                    onDelete={(task) => deleteMutation.mutate(task.id)}
                    onEdit={handleEdit}
                    emptyMessage={
                      activeTab === 'today' ? "No tasks for today" :
                      activeTab === 'upcoming' ? "No upcoming tasks" :
                      activeTab === 'completed' ? "No completed tasks yet" :
                      "No tasks yet"
                    }
                  />
                )}
              </div>
            </div>

            {/* Timeline for Today */}
            {activeTab === 'today' && (
              <div className="mt-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Today's Schedule</h3>
                <DayTimeline tasks={tasks.filter(t => t.due_date === todayStr)} />
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1 h-[600px]"
              >
                <ChatInterface onTasksUpdate={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ADHD Quick Log Widget */}
        {adhdProfile?.has_adhd && <ADHDQuickLog />}

        {/* Show Focus Booster if energy/symptoms are concerning */}
        {adhdProfile?.has_adhd && todayADHDLog && !showFocusBooster && (
          (todayADHDLog.energy_level <= 3 || todayADHDLog.symptom_severity >= 8)
        ) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-28 lg:bottom-6 right-4 lg:right-72 z-40 max-w-sm"
          >
            <button
              onClick={() => {
                setBoosterTrigger({
                  energy_level: todayADHDLog.energy_level,
                  symptom_severity: todayADHDLog.symptom_severity
                });
                setShowFocusBooster(true);
              }}
              className="w-full bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-medium text-sm"
            >
              🆘 Need Help? Try a Break
            </button>
          </motion.div>
        )}
      </div>
    </div>
        );
      }