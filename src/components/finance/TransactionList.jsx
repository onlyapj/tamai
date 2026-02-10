import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpRight, ArrowDownRight, Home, Car, Utensils, Zap, Film, Heart, ShoppingBag, PiggyBank, Briefcase, TrendingUp, MoreHorizontal, RefreshCw } from 'lucide-react';

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

export default function TransactionList({ transactions, onDelete }) {
  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    const date = t.date || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-medium text-slate-500 mb-2">
            {date !== 'Unknown' ? format(new Date(date), 'EEEE, MMMM d') : 'Unknown Date'}
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {items.map((transaction) => {
                const Icon = categoryIcons[transaction.category] || MoreHorizontal;
                const isIncome = transaction.type === 'income';
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className={`p-2.5 rounded-xl ${categoryColors[transaction.category] || categoryColors.other}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 truncate">
                          {transaction.description || transaction.sub_category || transaction.category?.replace('_', ' ')}
                        </p>
                        {transaction.recurring && (
                          <RefreshCw className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 capitalize">
                        {transaction.category?.replace('_', ' ')}
                        {transaction.sub_category && ` • ${transaction.sub_category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 font-semibold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isIncome ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5 text-slate-400" />}
                        ${transaction.amount?.toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => onDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No transactions yet</p>
        </div>
      )}
    </div>
  );
}