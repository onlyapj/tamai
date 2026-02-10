import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, RefreshCw, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
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

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 500)
  });

  const currencySymbol = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥', INR: '₹'
  }[user?.currency || 'USD'] || '$';

  const recurringTransactions = transactions.filter(t => t.recurring);
  const activeRecurring = recurringTransactions.filter(t => !t.paused);
  const pausedRecurring = recurringTransactions.filter(t => t.paused);

  const togglePauseMutation = useMutation({
    mutationFn: ({ id, paused }) => base44.entities.Transaction.update(id, { paused: !paused }),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Finance')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Recurring Transactions
                </span>
              </h1>
              <p className="text-sm text-slate-500">Manage automatic income & expenses</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-slate-500">Active</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{activeRecurring.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Pause className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Paused</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pausedRecurring.length}</p>
          </div>
        </div>

        {/* Active Recurring Transactions */}
        {activeRecurring.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Active</h3>
            <div className="space-y-3">
              {activeRecurring.map(transaction => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  currencySymbol={currencySymbol}
                  onEdit={() => setEditingTransaction(transaction)}
                  onTogglePause={() => togglePauseMutation.mutate({ id: transaction.id, paused: transaction.paused })}
                  onDelete={() => deleteMutation.mutate(transaction.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused Recurring Transactions */}
        {pausedRecurring.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Paused</h3>
            <div className="space-y-3 opacity-60">
              {pausedRecurring.map(transaction => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  currencySymbol={currencySymbol}
                  onEdit={() => setEditingTransaction(transaction)}
                  onTogglePause={() => togglePauseMutation.mutate({ id: transaction.id, paused: transaction.paused })}
                  onDelete={() => deleteMutation.mutate(transaction.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recurringTransactions.length === 0 && (
          <div className="text-center py-16">
            <RefreshCw className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No recurring transactions yet</p>
            <Link to={createPageUrl('Finance')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editingTransaction && (
            <EditRecurringModal
              transaction={editingTransaction}
              currencySymbol={currencySymbol}
              onClose={() => setEditingTransaction(null)}
              onSave={() => {
                queryClient.invalidateQueries(['transactions']);
                setEditingTransaction(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}