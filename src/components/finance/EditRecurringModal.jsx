import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const categories = {
  expense: ['housing', 'food', 'transport', 'utilities', 'entertainment', 'health', 'shopping', 'other'],
  income: ['income', 'investment', 'savings', 'other']
};

const subCategories = {
  housing: ['Rent', 'Mortgage', 'Insurance', 'Maintenance', 'Property Tax'],
  food: ['Groceries', 'Dining Out', 'Coffee', 'Snacks', 'Meal Delivery'],
  transport: ['Gas', 'Public Transit', 'Parking', 'Ride Share', 'Car Maintenance'],
  utilities: ['Electric', 'Water', 'Gas', 'Internet', 'Phone', 'Streaming'],
  entertainment: ['Movies', 'Concerts', 'Gaming', 'Sports', 'Hobbies'],
  health: ['Medical', 'Dental', 'Pharmacy', 'Gym', 'Wellness'],
  shopping: ['Clothing', 'Electronics', 'Home Goods', 'Gifts', 'Personal Care'],
  income: ['Salary', 'Freelance', 'Bonus', 'Refund'],
  investment: ['Stocks', 'Bonds', 'Crypto', 'Real Estate', 'Dividends'],
  savings: ['Emergency Fund', 'Retirement', 'Goals'],
  other: ['Miscellaneous']
};

export default function EditRecurringModal({ transaction, allTransactions, currencySymbol, onClose }) {
  const [amount, setAmount] = useState(transaction.amount?.toString() || '');
  const [category, setCategory] = useState(transaction.category);
  const [subCategory, setSubCategory] = useState(transaction.sub_category || '');
  const [description, setDescription] = useState(transaction.description || '');
  const [recurringPattern, setRecurringPattern] = useState(transaction.recurring_pattern);
  const [applyTo, setApplyTo] = useState('future');
  
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        amount: parseFloat(amount),
        category,
        sub_category: subCategory,
        description,
        recurring_pattern: recurringPattern
      };

      if (applyTo === 'template') {
        // Update only the template
        await base44.entities.Transaction.update(transaction.id, updates);
      } else if (applyTo === 'future') {
        // Update template and future occurrences
        await base44.entities.Transaction.update(transaction.id, updates);
        
        const related = allTransactions.filter(t => 
          t.description === transaction.description &&
          t.category === transaction.category &&
          t.amount === transaction.amount &&
          t.recurring_pattern === transaction.recurring_pattern &&
          new Date(t.date) >= new Date() &&
          t.id !== transaction.id
        );
        
        await Promise.all(related.map(t => base44.entities.Transaction.update(t.id, updates)));
      } else if (applyTo === 'all') {
        // Update all related transactions
        const related = allTransactions.filter(t => 
          t.description === transaction.description &&
          t.category === transaction.category &&
          t.amount === transaction.amount &&
          t.recurring_pattern === transaction.recurring_pattern
        );
        
        await Promise.all(related.map(t => base44.entities.Transaction.update(t.id, updates)));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recurring-transactions']);
      queryClient.invalidateQueries(['transactions']);
      toast.success('Recurring transaction updated');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update transaction');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Edit Recurring Transaction</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label className="text-xs text-slate-500">Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 text-lg font-semibold"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs text-slate-500">Category</Label>
            <Select value={category} onValueChange={(val) => { setCategory(val); setSubCategory(''); }} required>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories[transaction.type].map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Category */}
          {category && subCategories[category] && (
            <div>
              <Label className="text-xs text-slate-500">Sub-Category</Label>
              <Select value={subCategory} onValueChange={setSubCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories[category].map(subCat => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label className="text-xs text-slate-500">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-xs text-slate-500">Frequency</Label>
            <Select value={recurringPattern} onValueChange={setRecurringPattern}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply To */}
          <div className="pt-4 border-t border-slate-200">
            <Label className="text-xs text-slate-500 mb-2 block">Apply changes to:</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setApplyTo('template')}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  applyTo === 'template' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-800">Template only</p>
                <p className="text-xs text-slate-500">Future transactions will use new values</p>
              </button>
              <button
                type="button"
                onClick={() => setApplyTo('future')}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  applyTo === 'future' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-800">Future occurrences</p>
                <p className="text-xs text-slate-500">Update all upcoming transactions</p>
              </button>
              <button
                type="button"
                onClick={() => setApplyTo('all')}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  applyTo === 'all' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-800">All occurrences</p>
                <p className="text-xs text-slate-500">Update past and future transactions</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || !category || updateMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}