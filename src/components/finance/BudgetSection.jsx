import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

const categories = ['housing', 'food', 'transport', 'utilities', 'entertainment', 'health', 'shopping', 'other'];

const categoryColors = {
  housing: 'bg-blue-500',
  transport: 'bg-purple-500',
  food: 'bg-orange-500',
  utilities: 'bg-yellow-500',
  entertainment: 'bg-pink-500',
  health: 'bg-rose-500',
  shopping: 'bg-indigo-500',
  other: 'bg-slate-500'
};

export default function BudgetSection({ budgets, transactions, currentMonth }) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const queryClient = useQueryClient();

  const createBudget = useMutation({
    mutationFn: (data) => base44.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
      setShowForm(false);
      setCategory('');
      setLimit('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !limit) return;
    createBudget.mutate({
      category,
      monthly_limit: parseFloat(limit),
      month: currentMonth
    });
  };

  // Calculate spending per category
  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'other';
      acc[cat] = (acc[cat] || 0) + (t.amount || 0);
      return acc;
    }, {});

  const existingCategories = budgets.map(b => b.category);

  return (
    <div className="space-y-6">
      {/* Add Budget Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full border-dashed border-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Set Budget
        </Button>
      )}

      {/* Add Budget Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-4"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => !existingCategories.includes(c)).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Monthly limit"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={!category || !limit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Save
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Budget Cards */}
      <div className="space-y-3">
        {budgets.map((budget, i) => {
          const spent = spendingByCategory[budget.category] || 0;
          const percentage = Math.min((spent / budget.monthly_limit) * 100, 100);
          const isOver = spent > budget.monthly_limit;
          const isNear = percentage >= 80 && !isOver;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[budget.category] || categoryColors.other}`} />
                  <span className="font-medium text-slate-800 capitalize">{budget.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOver && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {!isOver && !isNear && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  <span className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-slate-700'}`}>
                    ${spent.toLocaleString()} / ${budget.monthly_limit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {isOver 
                  ? `$${(spent - budget.monthly_limit).toLocaleString()} over budget`
                  : `$${(budget.monthly_limit - spent).toLocaleString()} remaining`
                }
              </p>
            </motion.div>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-slate-500">No budgets set for this month</p>
          <p className="text-xs text-slate-400 mt-1">Set budgets to track your spending</p>
        </div>
      )}
    </div>
  );
}