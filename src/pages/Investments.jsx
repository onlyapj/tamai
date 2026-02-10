import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { AnimatePresence, motion } from 'framer-motion';
import InvestmentForm from '@/components/investments/InvestmentForm';
import InvestmentCard from '@/components/investments/InvestmentCard';
import PortfolioChart from '@/components/investments/PortfolioChart';

export default function Investments() {
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list('-created_date')
  });

  const currencySymbol = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥', INR: '₹'
  }[user?.currency || 'USD'] || '$';

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Investment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['investments']);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Investment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['investments']);
      setShowForm(false);
      setEditingInvestment(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['investments'])
  });

  const handleSubmit = (data) => {
    if (editingInvestment) {
      updateMutation.mutate({ id: editingInvestment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Calculate portfolio stats
  const totalCostBasis = investments.reduce((sum, inv) => sum + (inv.cost_basis || 0), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? ((totalGainLoss / totalCostBasis) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Finance')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Investments
                </span>
              </h1>
              <p className="text-sm text-slate-500">Track your portfolio performance</p>
            </div>
          </div>
          <Button 
            onClick={() => { setEditingInvestment(null); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Total Value</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{currencySymbol}{totalCurrentValue.toLocaleString()}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Gain/Loss</span>
            </div>
            <p className={`text-lg font-bold ${totalGainLoss >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{currencySymbol}{totalGainLoss.toLocaleString()}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              {totalGainLossPercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-xs font-medium">Return</span>
            </div>
            <p className={`text-lg font-bold ${totalGainLossPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
            </p>
          </motion.div>
        </div>

        {/* Portfolio Chart */}
        {investments.length > 0 && (
          <div className="mb-6">
            <PortfolioChart investments={investments} currencySymbol={currencySymbol} />
          </div>
        )}

        {/* Investment List */}
        <div className="space-y-3">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              currencySymbol={currencySymbol}
              onEdit={() => { setEditingInvestment(investment); setShowForm(true); }}
              onDelete={() => deleteMutation.mutate(investment.id)}
            />
          ))}
        </div>

        {investments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No investments tracked yet</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Investment
            </Button>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <InvestmentForm
              investment={editingInvestment}
              currencySymbol={currencySymbol}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingInvestment(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}