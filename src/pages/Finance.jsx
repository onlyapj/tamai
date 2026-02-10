import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TransactionList from '@/components/finance/TransactionList.jsx';
import AddTransaction from '@/components/finance/AddTransaction.jsx';
import FinanceOverview from '@/components/finance/FinanceOverview.jsx';
import BudgetSection from '@/components/finance/BudgetSection.jsx';
import AIInsights from '@/components/finance/AIInsights.jsx';
import { toast } from 'sonner';


export default function Finance() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const currentMonth = format(new Date(), 'yyyy-MM');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 100)
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => base44.entities.Budget.filter({ month: currentMonth })
  });

  const currencySymbol = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: '$',
    AUD: '$',
    CHF: 'Fr',
    CNY: '¥',
    INR: '₹'
  }[user?.currency || 'USD'] || '$';

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setShowAddTransaction(false);
    }
  });

  // Calculate totals for current month
  const monthTransactions = transactions.filter(t => t.date?.startsWith(currentMonth));
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'budget', label: 'Budget', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Finance</span>
            </h1>
            <p className="text-slate-500 mt-1">Track spending & build financial freedom</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('RecurringTransactions')}>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recurring
              </Button>
            </Link>
            <Button 
              onClick={() => setShowAddTransaction(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>



        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">Income</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{currencySymbol}{totalIncome.toLocaleString()}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-xs font-medium">Expenses</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{currencySymbol}{totalExpenses.toLocaleString()}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Balance</span>
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {currencySymbol}{Math.abs(balance).toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/60 p-1.5 rounded-2xl border border-slate-200/60">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FinanceOverview transactions={monthTransactions} currencySymbol={currencySymbol} />
            </motion.div>
          )}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AIInsights transactions={monthTransactions} budgets={budgets} currencySymbol={currencySymbol} />
            </motion.div>
          )}
          {activeTab === 'transactions' && (
            <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TransactionList 
                transactions={transactions}
                currencySymbol={currencySymbol}
                onDelete={(id) => base44.entities.Transaction.delete(id).then(() => queryClient.invalidateQueries(['transactions']))}
              />
            </motion.div>
          )}
          {activeTab === 'budget' && (
            <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BudgetSection budgets={budgets} transactions={monthTransactions} currentMonth={currentMonth} currencySymbol={currencySymbol} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Transaction Modal */}
        <AnimatePresence>
          {showAddTransaction && (
            <AddTransaction
              onSubmit={(data) => createTransaction.mutate(data)}
              onCancel={() => setShowAddTransaction(false)}
              isLoading={createTransaction.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}