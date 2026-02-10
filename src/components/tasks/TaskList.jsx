import React from 'react';
import { AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import { Inbox } from 'lucide-react';

export default function TaskList({ tasks, onToggle, onDelete, onEdit, emptyMessage = "No tasks yet" }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Inbox className="h-12 w-12 mb-3 stroke-[1.5] text-slate-300" />
        <p className="text-sm font-medium text-slate-700">Nothing here yet. Time to create your first task.</p>
        <p className="text-xs text-slate-500 mt-1">Your task list is empty — for now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}