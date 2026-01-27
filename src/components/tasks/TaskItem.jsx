import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const priorityStyles = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const isCompleted = task.status === 'completed';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className={cn(
        "group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300",
        isCompleted 
          ? "bg-slate-50/50 border-slate-100" 
          : "bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggle(task)}
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-all",
            isCompleted ? "border-slate-300" : "border-slate-300 data-[state=checked]:bg-indigo-600"
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-[15px] transition-all",
          isCompleted ? "text-slate-400 line-through" : "text-slate-800"
        )}>
          {task.title}
        </p>
        
        {task.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {task.priority && (
            <Badge variant="outline" className={cn("text-xs font-medium border", priorityStyles[task.priority])}>
              {task.priority}
            </Badge>
          )}
          
          {task.scheduled_time && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {task.scheduled_time}
            </span>
          )}
          
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          
          {task.list_name && task.list_name !== 'General' && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
              {task.list_name}
            </Badge>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2">
            <Edit2 className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(task)} className="gap-2 text-rose-600 focus:text-rose-600">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}