import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, PauseCircle, PlayCircle, Target } from 'lucide-react';

export default function GoalCard({ goal, gradientClass, onEdit, onDelete, onUpdate }) {
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800">{goal.title}</h3>
              {goal.status === 'completed' && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              {goal.status === 'paused' && (
                <PauseCircle className="h-4 w-4 text-slate-400" />
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{goal.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              {goal.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => onUpdate({ status: 'completed' })}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdate({ status: 'paused' })}>
                    <PauseCircle className="h-4 w-4 mr-2" /> Pause
                  </DropdownMenuItem>
                </>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => onUpdate({ status: 'active' })}>
                  <PlayCircle className="h-4 w-4 mr-2" /> Resume
                </DropdownMenuItem>
              )}
              {goal.status === 'completed' && (
                <DropdownMenuItem onClick={() => onUpdate({ status: 'active' })}>
                  <Target className="h-4 w-4 mr-2" /> Reopen
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-medium text-slate-700">{goal.progress || 0}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress || 0}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
            />
          </div>
        </div>

        {/* Milestones */}
        {totalMilestones > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-2">
              Milestones: {completedMilestones}/{totalMilestones}
            </p>
            <div className="space-y-1">
              {goal.milestones.slice(0, 3).map((milestone, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    milestone.completed ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className={milestone.completed ? 'text-slate-400 line-through' : 'text-slate-600'}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              {totalMilestones > 3 && (
                <p className="text-xs text-slate-400">+{totalMilestones - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full capitalize ${
            goal.category === 'productivity' ? 'bg-indigo-100 text-indigo-700' :
            goal.category === 'health' ? 'bg-rose-100 text-rose-700' :
            goal.category === 'financial' ? 'bg-emerald-100 text-emerald-700' :
            goal.category === 'mental' ? 'bg-violet-100 text-violet-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {goal.category}
          </span>
          {goal.target_date && (
            <span className="text-slate-500">
              Due {format(new Date(goal.target_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}