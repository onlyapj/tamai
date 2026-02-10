import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  planning: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-gray-100 text-gray-800'
};

export default function ProjectCard({ project, teamId }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.SharedProject.delete(project.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-projects', teamId] })
  });

  const completionRate = project.task_count > 0 
    ? Math.round((project.completed_tasks / project.task_count) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{project.name}</h3>
          <p className="text-sm text-slate-600 mt-1">{project.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge className={statusColors[project.status]}>
            {project.status.replace('_', ' ')}
          </Badge>
          {project.target_date && (
            <span className="text-xs text-slate-500">
              Due {format(new Date(project.target_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        {project.task_count > 0 && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">Progress</span>
              <span className="text-xs text-slate-600">{project.completed_tasks}/{project.task_count}</span>
            </div>
            <Progress value={completionRate} />
          </div>
        )}

        {project.assigned_members?.length > 0 && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Team:</span>
            <div className="flex gap-1">
              {project.assigned_members.slice(0, 3).map((email, idx) => (
                <div key={idx} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-medium">
                  {email.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.assigned_members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium">
                  +{project.assigned_members.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}