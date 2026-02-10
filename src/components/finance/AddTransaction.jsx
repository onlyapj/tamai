import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { X, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

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

export default function AddTransaction({ onSubmit, onCancel, isLoading }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('monthly');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      sub_category: subCategory,
      description,
      date,
      recurring,
      recurring_pattern: recurring ? recurringPattern : undefined
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Add Transaction</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'expense' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-xs text-slate-500">Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
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
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[type].map(cat => (
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
              <Label className="text-xs text-slate-500">Sub-Category (optional)</Label>
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
            <Label className="text-xs text-slate-500">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="mt-1"
            />
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs text-slate-500">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Checkbox 
              id="recurring" 
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <div className="flex-1">
              <Label htmlFor="recurring" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Recurring Transaction
              </Label>
              <p className="text-xs text-slate-500">Auto-log this regularly</p>
            </div>
          </div>

          {recurring && (
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
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || !category || isLoading}
              className={`flex-1 ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'}`}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}