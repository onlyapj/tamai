import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EventTemplateManager({ onSelectTemplate, onCancel }) {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    duration_minutes: 30,
    scheduled_time: '10:00',
    priority: 'medium',
    list_name: 'General',
    recurring_pattern: 'weekly',
    reminder_minutes: 15
  });
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EventTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      setShowCreateTemplate(false);
      resetForm();
      toast.success('Template created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      duration_minutes: 30,
      scheduled_time: '10:00',
      priority: 'medium',
      list_name: 'General',
      recurring_pattern: 'weekly',
      reminder_minutes: 15
    });
    setEditingTemplate(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.title) {
      toast.error('Template name and event title are required');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Event Templates</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {!showCreateTemplate ? (
            <>
              <Button 
                onClick={() => setShowCreateTemplate(true)}
                className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>

              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No templates yet. Create one to speed up event scheduling!</p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{template.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">📌 {template.title}</p>
                          {template.description && (
                            <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{template.scheduled_time}</span>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{template.duration_minutes}min</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{template.recurring_pattern}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSelectTemplate(template)}
                            title="Use this template"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(template.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekly Meeting, Team Standup"
                  required
                />
              </div>

              <div>
                <Label>Event Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title that appears in calendar"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional notes about this template"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    min="5"
                    step="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.list_name}
                    onChange={(e) => setFormData({ ...formData, list_name: e.target.value })}
                    placeholder="Work, Personal..."
                  />
                </div>
              </div>

              <div>
                <Label>Repeat Pattern</Label>
                <Select value={formData.recurring_pattern} onValueChange={(value) => setFormData({ ...formData, recurring_pattern: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowCreateTemplate(false); resetForm(); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {createMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}