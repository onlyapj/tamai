import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Trash2, Edit, TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2, Landmark, PieChart } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = {
  stock: DollarSign,
  bond: Landmark,
  crypto: Bitcoin,
  etf: PieChart,
  mutual_fund: PieChart,
  real_estate: Building2,
  other: DollarSign
};

const typeColors = {
  stock: 'bg-blue-100 text-blue-600',
  bond: 'bg-green-100 text-green-600',
  crypto: 'bg-orange-100 text-orange-600',
  etf: 'bg-purple-100 text-purple-600',
  mutual_fund: 'bg-indigo-100 text-indigo-600',
  real_estate: 'bg-emerald-100 text-emerald-600',
  other: 'bg-slate-100 text-slate-600'
};

export default function InvestmentCard({ investment, currencySymbol, onEdit, onDelete }) {
  const Icon = typeIcons[investment.type] || DollarSign;
  const gainLoss = (investment.current_value || 0) - (investment.cost_basis || 0);
  const gainLossPercent = investment.cost_basis > 0 
    ? ((gainLoss / investment.cost_basis) * 100) 
    : 0;
  const isPositive = gainLoss >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${typeColors[investment.type] || typeColors.other}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{investment.name}</p>
                {investment.ticker && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                    {investment.ticker}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 capitalize mt-0.5">
                {investment.type.replace('_', ' ')} • {investment.quantity} units
              </p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {currencySymbol}{investment.current_value?.toLocaleString()}
            </p>
          </div>

          {/* Performance */}
          <div className="flex items-center gap-4 mb-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              isPositive ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-sm font-semibold ${
                isPositive ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {isPositive ? '+' : ''}{currencySymbol}{Math.abs(gainLoss).toLocaleString()}
              </span>
              <span className={`text-xs ${
                isPositive ? 'text-emerald-600' : 'text-red-500'
              }`}>
                ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Cost: {currencySymbol}{investment.cost_basis?.toLocaleString()}
            </div>
          </div>

          {investment.purchase_date && (
            <p className="text-xs text-slate-500 mb-3">
              Purchased: {format(new Date(investment.purchase_date), 'MMM d, yyyy')}
            </p>
          )}

          {investment.notes && (
            <p className="text-xs text-slate-600 mb-3 bg-slate-50 rounded-lg p-2">
              {investment.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
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
    </motion.div>
  );
}