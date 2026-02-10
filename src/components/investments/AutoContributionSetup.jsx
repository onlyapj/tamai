import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function AutoContributionSetup({ investment, currencySymbol, onSubmit, onCancel, isLoading }) {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      investment_id: investment.id,
      amount: parseFloat(amount),
      frequency,
      next_contribution_date: startDate,
      is_active: true,
      trigger_type: 'scheduled'
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
            <h3 className="text-lg font-semibold text-slate-800">Auto-Contribute</h3>
            <p className="text-xs text-slate-500 mt-1">{investment.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-slate-500">Contribution Amount *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {currencySymbol}
              </span>
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
            <p className="text-xs text-slate-500 mt-1">Amount to invest automatically</p>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Frequency *</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (Every 3 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Start Date *</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              required
            />
            <p className="text-xs text-slate-500 mt-1">First contribution date</p>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div className="text-xs text-indigo-700">
                <p className="font-medium mb-1">Automatic Investment Schedule</p>
                <p>Contributions will be processed automatically on the scheduled dates. You can pause or cancel anytime.</p>
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
              {isLoading ? 'Setting up...' : 'Enable Auto-Contribute'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}