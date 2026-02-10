import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

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

export default function EditRecurringModal({ transaction, currencySymbol, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1 = edit form, 2 = scope selection
  const [amount, setAmount] = useState(transaction.amount?.toString() || '');
  const [category, setCategory] = useState(transaction.category || '');
  const [subCategory, setSubCategory] = useState(transaction.sub_category || '');
  const [description, setDescription] = useState(transaction.description || '');
  const [recurringPattern, setRecurringPattern] = useState(transaction.recurring_pattern || 'monthly');
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {
      amount: parseFloat(amount),
      category,
      sub_category: subCategory,
      description,
      recurring_pattern: recurringPattern
    };
    setEditedData(updates);
    setStep(2); // Show scope selection
  };

  const applyChanges = async (scope) => {
    setSaving(true);
    try {
      if (scope === 'future') {
        // Update this transaction
        await base44.entities.Transaction.update(transaction.id, editedData);
      } else if (scope === 'all') {
        // Find all past transactions with same description/category and update them
        const allTransactions = await base44.entities.Transaction.list('-date', 1000);
        const matching = allTransactions.filter(t => 
          t.description === transaction.description && 
          t.category === transaction.category &&
          t.recurring
        );
        await Promise.all(matching.map(t => 
          base44.entities.Transaction.update(t.id, editedData)
        ));
      } else if (scope === 'recent') {
        // Only update the most recent occurrence
        const allTransactions = await base44.entities.Transaction.list('-date', 1000);
        const recent = allTransactions
          .filter(t => 
            t.description === transaction.description && 
            t.category === transaction.category
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        if (recent) {
          await base44.entities.Transaction.update(recent.id, {
            ...editedData,
            recurring: false // Make it non-recurring
          });
        }
      }
      onSave();
    } catch (error) {
      console.error('Failed to update:', error);
    }
    setSaving(false);
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
        className="bg-white rounded-3xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="edit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Edit Recurring Transaction</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Category</Label>
                  <Select value={category} onValueChange={(val) => { setCategory(val); setSubCategory(''); }} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[transaction.type].map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div>
                  <Label className="text-xs text-slate-500">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

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

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Next
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="scope" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Apply Changes</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Choose how to apply your changes to this recurring transaction
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => applyChanges('future')}
                  disabled={saving}
                  className="w-full text-left p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <p className="font-medium text-slate-800 mb-1">Future occurrences only</p>
                  <p className="text-xs text-slate-500">Update this recurring transaction going forward</p>
                </button>

                <button
                  onClick={() => applyChanges('all')}
                  disabled={saving}
                  className="w-full text-left p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <p className="font-medium text-slate-800 mb-1">All past & future occurrences</p>
                  <p className="text-xs text-slate-500">Update all matching transactions in history</p>
                </button>

                <button
                  onClick={() => applyChanges('recent')}
                  disabled={saving}
                  className="w-full text-left p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <p className="font-medium text-slate-800 mb-1">Most recent occurrence only</p>
                  <p className="text-xs text-slate-500">Update just the latest entry (stops recurring)</p>
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={saving}
                className="w-full mt-4"
              >
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}