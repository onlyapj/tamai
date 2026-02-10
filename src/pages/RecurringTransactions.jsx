import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RecurringTransactionCard from '@/components/finance/RecurringTransactionCard';
import EditRecurringModal from '@/components/finance/EditRecurringModal';
import { AnimatePresence } from 'framer-motion';

export default function RecurringTransactions() {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: recurringTransactions = [] } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const all = await base44.entities.Transaction.filter({ recurring: true });
      return all.sort((a, b) => new Date(a.next_occurrence || a.date) - new Date(b.next_occurrence || b.date));
    }
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 500)
  });

  const currencySymbol = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥', INR: '₹'
  }[user?.currency || 'USD'] || '$';

  const togglePause = useMutation({
    mutationFn: async ({ id, isPaused }) => {
      await base44.entities.Transaction.update(id, { 
        recurring_paused: !isPaused 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recurring-transactions']);
      queryClient.invalidateQueries(['transactions']);
    }
  });

  const deleteRecurring = useMutation({
    mutationFn: async ({ id, applyTo }) => {
      if (applyTo === 'all') {
        // Find all related transactions (same description, category, amount, recurring pattern)
        const template = recurringTransactions.find(t => t.id === id);
        const related = allTransactions.filter(t => 
          t.description === template.description &&
          t.category === template.category &&
          t.amount === template.amount &&
          t.recurring_pattern === template.recurring_pattern
        );
        
        await Promise.all(related.map(t => base44.entities.Transaction.delete(t.id)));
      } else if (applyTo === 'future') {
        const template = recurringTransactions.find(t => t.id === id);
        const related = allTransactions.filter(t => 
          t.description === template.description &&
          t.category === template.category &&
          t.amount === template.amount &&
          t.recurring_pattern === template.recurring_pattern &&
          new Date(t.date) >= new Date()
        );
        
        await Promise.all(related.map(t => base44.entities.Transaction.delete(t.id)));
      } else {
        await base44.entities.Transaction.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recurring-transactions']);
      queryClient.invalidateQueries(['transactions']);
    }
  });

  const activeRecurring = recurringTransactions.filter(t => !t.recurring_paused);
  const pausedRecurring = recurringTransactions.filter(t => t.recurring_paused);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Finance')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Recurring Transactions</h1>
            <p className="text-slate-500 text-sm">Manage your automatic income & expenses</p>
          </div>
        </div>

        {/* Active Recurring */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Active ({activeRecurring.length})</h2>
          </div>
          
          {activeRecurring.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <RefreshCw className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No active recurring transactions</p>
              <p className="text-xs text-slate-400 mt-1">Add recurring transactions from the Finance page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecurring.map(transaction => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  currencySymbol={currencySymbol}
                  onEdit={() => setEditingTransaction(transaction)}
                  onTogglePause={() => togglePause.mutate({ id: transaction.id, isPaused: false })}
                  onDelete={(applyTo) => deleteRecurring.mutate({ id: transaction.id, applyTo })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Paused Recurring */}
        {pausedRecurring.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center">
                <div className="h-2 w-2 bg-slate-400 rounded-full" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Paused ({pausedRecurring.length})</h2>
            </div>
            
            <div className="space-y-3">
              {pausedRecurring.map(transaction => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  currencySymbol={currencySymbol}
                  onEdit={() => setEditingTransaction(transaction)}
                  onTogglePause={() => togglePause.mutate({ id: transaction.id, isPaused: true })}
                  onDelete={(applyTo) => deleteRecurring.mutate({ id: transaction.id, applyTo })}
                  isPaused
                />
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editingTransaction && (
            <EditRecurringModal
              transaction={editingTransaction}
              allTransactions={allTransactions}
              currencySymbol={currencySymbol}
              onClose={() => setEditingTransaction(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}