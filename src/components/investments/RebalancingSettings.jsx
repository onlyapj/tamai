import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Scale } from 'lucide-react';

export default function RebalancingSettings({ investment, onSubmit, onCancel, isLoading }) {
  const [autoRebalance, setAutoRebalance] = useState(investment.auto_rebalance || false);
  const [targetPercent, setTargetPercent] = useState(
    investment.target_allocation_percent?.toString() || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      auto_rebalance: autoRebalance,
      target_allocation_percent: targetPercent ? parseFloat(targetPercent) : undefined
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Rebalancing Settings</h3>
            <p className="text-xs text-slate-500 mt-1">{investment.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="auto-rebalance" className="text-sm font-medium text-slate-700 cursor-pointer">
                Enable Auto-Rebalancing
              </Label>
              <p className="text-xs text-slate-500 mt-1">Automatically adjust allocation</p>
            </div>
            <Switch
              id="auto-rebalance"
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
          </div>

          {autoRebalance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label className="text-xs text-slate-500">Target Portfolio Allocation *</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={targetPercent}
                  onChange={(e) => setTargetPercent(e.target.value)}
                  placeholder="0"
                  className="pr-8 text-lg font-semibold"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target percentage of total portfolio value
              </p>
            </motion.div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-2">
              <Scale className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">How Auto-Rebalancing Works</p>
                <p>When your investment deviates more than 5% from the target allocation, you'll receive recommendations to buy or sell to maintain your desired portfolio balance.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}