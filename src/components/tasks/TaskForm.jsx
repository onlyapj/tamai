import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Clock, Tag, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const defaultLists = ['General', 'Work', 'Personal', 'Shopping', 'Health'];

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    scheduled_time: '',
    duration_minutes: null,
    list_name: 'General',
    status: 'pending'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        scheduled_time: task.scheduled_time || '',
        duration_minutes: task.duration_minutes || null,
        list_name: task.list_name || 'General',
        status: task.status || 'pending'
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {task ? 'Edit Task' : 'What needs to get done?'}
          </h3>
          {!task && <p className="text-xs text-slate-500 mt-1">Add a task and assign an owner.</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-base border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <Textarea
            placeholder="Add notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="resize-none h-20 border-slate-200 focus-visible:ring-indigo-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-500 flex items-center gap-1.5">
              <Flag className="h-3 w-3" /> Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500 flex items-center gap-1.5">
              <Tag className="h-3 w-3" /> List
            </Label>
            <Select
              value={formData.list_name}
              onValueChange={(value) => setFormData({ ...formData, list_name: value })}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultLists.map(list => (
                  <SelectItem key={list} value={list}>{list}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-500 flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3" /> Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-slate-200",
                    !formData.due_date && "text-slate-400"
                  )}
                >
                  {formData.due_date ? format(new Date(formData.due_date), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date ? new Date(formData.due_date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, due_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Time
            </Label>
            <Input
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              className="border-slate-200"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            {task ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}