import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Pause, Play, RefreshCw, Home, Car, Utensils, Zap, Film, Heart, ShoppingBag, PiggyBank, Briefcase, TrendingUp, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons = {
  housing: Home,
  transport: Car,
  food: Utensils,
  utilities: Zap,
  entertainment: Film,
  health: Heart,
  shopping: ShoppingBag,
  savings: PiggyBank,
  income: Briefcase,
  investment: TrendingUp,
  other: MoreHorizontal
};

const categoryColors = {
  housing: 'bg-blue-100 text-blue-600',
  transport: 'bg-purple-100 text-purple-600',
  food: 'bg-orange-100 text-orange-600',
  utilities: 'bg-yellow-100 text-yellow-600',
  entertainment: 'bg-pink-100 text-pink-600',
  health: 'bg-rose-100 text-rose-600',
  shopping: 'bg-indigo-100 text-indigo-600',
  savings: 'bg-emerald-100 text-emerald-600',
  income: 'bg-green-100 text-green-600',
  investment: 'bg-teal-100 text-teal-600',
  other: 'bg-slate-100 text-slate-600'
};

export default function RecurringTransactionCard({ transaction, currencySymbol, onEdit, onTogglePause, onDelete }) {
  const Icon = categoryIcons[transaction.category] || MoreHorizontal;
  const isPaused = transaction.paused;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${categoryColors[transaction.category] || categoryColors.other}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {transaction.description || transaction.sub_category || transaction.category?.replace('_', ' ')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <RefreshCw className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-500 capitalize">
                  {transaction.recurring_pattern?.replace('_', ' ')}
                </span>
                {transaction.next_occurrence && (
                  <span className="text-xs text-slate-500">
                    • Next: {format(new Date(transaction.next_occurrence), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
            <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
              {transaction.type === 'income' ? '+' : ''}{currencySymbol}{transaction.amount?.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              className="h-8 text-xs"
            >
              {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}