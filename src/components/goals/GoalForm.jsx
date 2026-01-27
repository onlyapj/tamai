import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Plus, Trash2 } from 'lucide-react';

const categories = ['productivity', 'health', 'financial', 'mental', 'personal'];

export default function GoalForm({ goal, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    progress: 0,
    milestones: []
  });

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'personal',
        target_date: goal.target_date || '',
        progress: goal.progress || 0,
        milestones: goal.milestones || []
      });
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  const addMilestone = () => {
    setForm({
      ...form,
      milestones: [...form.milestones, { title: '', completed: false }]
    });
  };

  const updateMilestone = (index, value) => {
    const newMilestones = [...form.milestones];
    newMilestones[index] = { ...newMilestones[index], title: value };
    setForm({ ...form, milestones: newMilestones });
  };

  const toggleMilestone = (index) => {
    const newMilestones = [...form.milestones];
    newMilestones[index] = { ...newMilestones[index], completed: !newMilestones[index].completed };
    setForm({ ...form, milestones: newMilestones });
  };

  const removeMilestone = (index) => {
    setForm({
      ...form,
      milestones: form.milestones.filter((_, i) => i !== index)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {goal ? 'Edit Goal' : 'New Goal'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label className="text-xs text-slate-500">Goal Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What do you want to achieve?"
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-slate-500">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why is this important to you?"
              className="mt-1 resize-none h-20"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Target Date</Label>
              <Input
                type="date"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs text-slate-500">Progress</Label>
              <span className="text-xs font-medium text-slate-700">{form.progress}%</span>
            </div>
            <Slider
              value={[form.progress]}
              onValueChange={([val]) => setForm({ ...form, progress: val })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-slate-500">Milestones</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMilestone(i)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      milestone.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300'
                    }`}
                  >
                    {milestone.completed && '✓'}
                  </button>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(i, e.target.value)}
                    placeholder="Milestone"
                    className="flex-1 h-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-red-500"
                    onClick={() => removeMilestone(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.title.trim() || isLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? 'Saving...' : goal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}