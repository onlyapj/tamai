import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, TrendingUp, TrendingDown, Gift, Zap } from 'lucide-react';
import { format } from 'date-fns';

const transactionTypeConfig = {
  buy: { icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Buy' },
  sell: { icon: TrendingDown, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Sell' },
  dividend: { icon: Gift, color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Dividend' },
  fee: { icon: Zap, color: 'bg-red-50 text-red-700 border-red-200', label: 'Fee' }
};

export default function TransactionHistory({ transactions, currencySymbol, onAdd, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500 mb-4">No transactions recorded yet</p>
        <Button 
          onClick={onAdd}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Transaction
        </Button>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-2">
      {sortedTransactions.map((transaction, index) => {
        const config = transactionTypeConfig[transaction.type];
        const Icon = config.icon;
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2.5 rounded-lg border ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{config.label}</p>
                    {transaction.quantity && transaction.price && (
                      <span className="text-xs text-slate-500">
                        {transaction.quantity.toFixed(8)} @ {currencySymbol}{transaction.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </p>
                  {transaction.notes && (
                    <p className="text-xs text-slate-600 mt-1">{transaction.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'fee' ? 'text-red-600' : transaction.type === 'sell' ? 'text-blue-600' : 'text-slate-900'}`}>
                    {transaction.type === 'sell' ? '-' : transaction.type === 'fee' ? '-' : '+'}{currencySymbol}{Math.abs(transaction.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}