import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from 'lucide-react';

export default function ProjectForm({ teamId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    target_date: ''
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedProject.create({
      ...data,
      team_id: teamId,
      owner_email: (async () => (await base44.auth.me()).email)()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-projects', teamId] });
      setFormData({ name: '', description: '', status: 'planning', target_date: '' });
      onSuccess?.();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me();
    createMutation.mutate({
      ...formData,
      team_id: teamId,
      owner_email: user.email
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Create New Project</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <Input
        placeholder="Project name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Textarea
        placeholder="Project description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={formData.target_date}
          onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Create Project
        </Button>
      </div>
    </form>
  );
}