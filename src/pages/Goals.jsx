import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import GoalCard from '@/components/goals/GoalCard.jsx';
import GoalForm from '@/components/goals/GoalForm.jsx';
import CoachingDashboard from '@/components/health/CoachingDashboard.jsx';

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('active');
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date')
  });

  const createGoal = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setShowForm(false);
    }
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setShowForm(false);
      setEditingGoal(null);
    }
  });

  const deleteGoal = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['goals'])
  });

  const filteredGoals = goals.filter(g => filter === 'all' || g.status === filter);
  
  const categoryColors = {
    productivity: 'from-indigo-500 to-blue-500',
    health: 'from-rose-500 to-orange-500',
    financial: 'from-emerald-500 to-teal-500',
    mental: 'from-violet-500 to-purple-500',
    personal: 'from-amber-500 to-yellow-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Goals</span>
            </h1>
            <p className="text-slate-500 mt-1">Set intentions & track your progress</p>
          </div>
          <Button 
            onClick={() => { setEditingGoal(null); setShowForm(true); }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Weekly Coaching */}
        <div className="mb-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Weekly Coaching</h2>
          <CoachingDashboard />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Active', count: goals.filter(g => g.status === 'active').length, icon: Target, color: 'text-amber-600' },
            { label: 'Completed', count: goals.filter(g => g.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Paused', count: goals.filter(g => g.status === 'paused').length, icon: Clock, color: 'text-slate-500' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-slate-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['active', 'completed', 'paused', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <GoalCard
                  goal={goal}
                  gradientClass={categoryColors[goal.category] || categoryColors.personal}
                  onEdit={() => { setEditingGoal(goal); setShowForm(true); }}
                  onDelete={() => deleteGoal.mutate(goal.id)}
                  onUpdate={(data) => updateGoal.mutate({ id: goal.id, data })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-slate-500">No goals yet. Set your first goal!</p>
          </div>
        )}

        {/* Goal Form Modal */}
        <AnimatePresence>
          {showForm && (
            <GoalForm
              goal={editingGoal}
              onSubmit={(data) => editingGoal 
                ? updateGoal.mutate({ id: editingGoal.id, data })
                : createGoal.mutate(data)
              }
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
              isLoading={createGoal.isPending || updateGoal.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}