import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, addMinutes, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Bell, Clock, ChevronLeft, ChevronRight, Settings, LayoutGrid, ListIcon } from 'lucide-react';
import CalendarView from '../components/calendar/CalendarView.jsx';
import EventForm from '../components/calendar/EventForm.jsx';
import DaySchedule from '../components/calendar/DaySchedule.jsx';
import WeeklyView from '../components/calendar/WeeklyView.jsx';
import GoogleCalendarSync from '../components/calendar/GoogleCalendarSync.jsx';
import { toast } from 'sonner';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'day'
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date')
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const task = await base44.entities.Task.create(data);
      
      // Auto-export to Google Calendar if available
      try {
        await base44.functions.invoke('syncGoogleCalendar', {
          action: 'export_event',
          calendarIds: ['primary'],
          taskId: task.id,
          taskData: data
        });
      } catch (error) {
        // Silently fail if Google Calendar not connected
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowEventForm(false);
      toast.success('Event added to calendar');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowEventForm(false);
      setEditingTask(null);
      toast.success('Event updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Event deleted');
    }
  });

  // Check for upcoming reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.due_date || !task.scheduled_time || !task.reminder_minutes || task.status === 'completed') return;
        
        const [hours, minutes] = task.scheduled_time.split(':');
        const scheduledDateTime = parseISO(task.due_date);
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const reminderTime = addMinutes(scheduledDateTime, -task.reminder_minutes);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Show reminder if it's within the next minute
        if (timeDiff > 0 && timeDiff < 60000) {
          setTimeout(() => {
            toast.info(`Reminder: ${task.title}`, {
              description: `Starting in ${task.reminder_minutes} minutes`,
              duration: 10000,
              icon: <Bell className="h-4 w-4" />
            });
            
            // Browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('TAMAI Reminder', {
                body: `${task.title} - Starting in ${task.reminder_minutes} minutes`,
                icon: '/favicon.ico'
              });
            }
          }, timeDiff);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [tasks]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const selectedDateTasks = tasks.filter(task => 
    task.due_date && isSameDay(parseISO(task.due_date), selectedDate)
  );

  const handleSubmit = (data) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Calendar</span>
            </h1>
            <p className="text-slate-500 mt-1">Schedule your time with intention</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSyncSettings(!showSyncSettings)}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button 
              onClick={() => { setEditingTask(null); setShowEventForm(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {viewMode === 'month' ? format(currentMonth, 'MMMM yyyy') : format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            {(viewMode === 'month' || viewMode === 'week') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'month' ? setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))) : setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'month' ? setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))) : setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            {viewMode === 'day' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
              title="Month view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              title="Week view"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
              title="Day view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Google Calendar Sync */}
        <AnimatePresence>
          {showSyncSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <GoogleCalendarSync 
                onSyncComplete={() => queryClient.invalidateQueries(['tasks'])}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            <motion.div
              key="month"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <CalendarView
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  currentMonth={currentMonth}
                />
              </div>

              {/* Selected Day Schedule */}
              <div className="lg:col-span-1">
                <DaySchedule
                  date={selectedDate}
                  tasks={selectedDateTasks}
                  onEdit={(task) => { setEditingTask(task); setShowEventForm(true); }}
                  onDelete={(task) => deleteMutation.mutate(task.id)}
                  onToggle={(task) => updateMutation.mutate({ 
                    id: task.id, 
                    data: { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
                  })}
                />
              </div>
            </motion.div>
          ) : viewMode === 'week' ? (
            <motion.div
              key="week"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full overflow-x-auto"
            >
              <WeeklyView
                date={selectedDate}
                tasks={tasks}
                onEdit={(task) => { setEditingTask(task); setShowEventForm(true); }}
                onDelete={(task) => deleteMutation.mutate(task.id)}
                onToggle={(task) => updateMutation.mutate({ 
                  id: task.id, 
                  data: { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
                })}
              />
            </motion.div>
          ) : (
            <motion.div
              key="day"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <DaySchedule
                date={selectedDate}
                tasks={selectedDateTasks}
                onEdit={(task) => { setEditingTask(task); setShowEventForm(true); }}
                onDelete={(task) => deleteMutation.mutate(task.id)}
                onToggle={(task) => updateMutation.mutate({ 
                  id: task.id, 
                  data: { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
                })}
                fullScreen
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Form Modal */}
        <AnimatePresence>
          {showEventForm && (
            <EventForm
              task={editingTask}
              defaultDate={selectedDate}
              onSubmit={handleSubmit}
              onCancel={() => { setShowEventForm(false); setEditingTask(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}