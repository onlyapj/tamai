import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionForm({ transaction, investment, currencySymbol, onSubmit, onCancel, isLoading }) {
  const [type, setType] = useState(transaction?.type || 'buy');
  const [quantity, setQuantity] = useState(transaction?.quantity?.toString() || '');
  const [price, setPrice] = useState(transaction?.price?.toString() || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [date, setDate] = useState(transaction?.date || format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState(transaction?.notes || '');

  const handleQuantityChange = (value) => {
    setQuantity(value);
    if (value && price && (type === 'buy' || type === 'sell')) {
      const calculated = parseFloat(value) * parseFloat(price);
      setAmount(calculated.toFixed(2));
    }
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    if (value && quantity && (type === 'buy' || type === 'sell')) {
      const calculated = parseFloat(quantity) * parseFloat(value);
      setAmount(calculated.toFixed(2));
    }
  };

  const handleTypeChange = (value) => {
    setType(value);
    setQuantity('');
    setPrice('');
    setAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    onSubmit({
      investment_id: investment.id,
      type,
      quantity: (type === 'buy' || type === 'sell') ? parseFloat(quantity) : undefined,
      price: (type === 'buy' || type === 'sell') ? parseFloat(price) : undefined,
      amount: parseFloat(amount),
      date,
      notes: notes || undefined
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
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investment Name */}
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium">Investment</p>
            <p className="text-sm font-semibold text-indigo-900 mt-1">{investment.name}</p>
          </div>

          {/* Transaction Type */}
          <div>
            <Label className="text-xs text-slate-500">Type *</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="dividend">Dividend</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity (for buy/sell) */}
          {(type === 'buy' || type === 'sell') && (
            <div>
              <Label className="text-xs text-slate-500">Quantity *</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="0.00"
                step="0.00000001"
                min="0"
                className="mt-1"
                required
              />
            </div>
          )}

          {/* Price (for buy/sell) */}
          {(type === 'buy' || type === 'sell') && (
            <div>
              <Label className="text-xs text-slate-500">Price per Unit *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  required
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label className="text-xs text-slate-500">{type === 'fee' ? 'Fee Amount' : 'Total Amount'} *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs text-slate-500">Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-slate-500">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              className="mt-1 h-16"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Saving...' : transaction ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}