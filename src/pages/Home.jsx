import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Calendar, ListTodo, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import ChatInterface from '../components/chat/ChatInterface';
import DayTimeline from '../components/dashboard/DayTimeline';
import QuickStats from '../components/dashboard/QuickStats';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [showChat, setShowChat] = useState(false);
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

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const filteredTasks = {
    today: tasks.filter(t => t.due_date === todayStr && t.status !== 'completed'),
    upcoming: tasks.filter(t => t.due_date && t.due_date > todayStr && t.status !== 'completed'),
    all: tasks.filter(t => t.status !== 'completed'),
    completed: tasks.filter(t => t.status === 'completed')
  }[activeTab] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
            </h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex gap-3">
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

        {/* Stats */}
        <div className="mb-8">
          <QuickStats tasks={tasks} />
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
      </div>
    </div>
  );
}