import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const investmentTypes = [
  { value: 'stock', label: 'Stock' },
  { value: 'bond', label: 'Bond' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' }
];

const cryptoOptions = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'MATIC', name: 'Polygon' }
];

export default function InvestmentForm({ investment, currencySymbol, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(investment?.name || '');
  const [type, setType] = useState(investment?.type || 'stock');
  const [ticker, setTicker] = useState(investment?.ticker || '');
  const [quantity, setQuantity] = useState(investment?.quantity?.toString() || '');
  const [costBasis, setCostBasis] = useState(investment?.cost_basis?.toString() || '');
  const [currentValue, setCurrentValue] = useState(investment?.current_value?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState(
    investment?.purchase_date || format(new Date(), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState(investment?.notes || '');
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [livePrice, setLivePrice] = useState(null);

  const fetchLivePrice = async () => {
    if (!ticker || !ticker.trim()) {
      toast.error('Enter a ticker symbol first');
      return;
    }

    setFetchingPrice(true);
    try {
      const { data } = await base44.functions.invoke('fetchLivePrice', { 
        ticker: ticker.trim(),
        type 
      });
      
      setLivePrice(data.price);
      
      // Auto-calculate current value if quantity is set
      if (quantity && parseFloat(quantity) > 0) {
        const calculatedValue = data.price * parseFloat(quantity);
        setCurrentValue(calculatedValue.toFixed(2));
      }
      
      toast.success(`Live price: ${currencySymbol}${data.price.toLocaleString()}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch live price');
      setLivePrice(null);
    } finally {
      setFetchingPrice(false);
    }
  };

  // Auto-calculate cost basis and current value when quantity changes
  const handleQuantityChange = (value) => {
    setQuantity(value);
    if (livePrice && value && parseFloat(value) > 0) {
      const calculatedCostBasis = livePrice * parseFloat(value);
      setCostBasis(calculatedCostBasis.toFixed(2));
      setCurrentValue(calculatedCostBasis.toFixed(2));
    }
  };

  // Auto-calculate quantity and current value when cost basis changes
  const handleCostBasisChange = (value) => {
    setCostBasis(value);
    if (livePrice && value && parseFloat(value) > 0) {
      const calculatedQuantity = parseFloat(value) / livePrice;
      setQuantity(calculatedQuantity.toFixed(8));
      setCurrentValue(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      ticker: ticker || undefined,
      quantity: parseFloat(quantity),
      cost_basis: parseFloat(costBasis),
      current_value: parseFloat(currentValue),
      purchase_date: purchaseDate,
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
            {investment ? 'Edit Investment' : 'Add Investment'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label className="text-xs text-slate-500">Investment Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Apple Stock, Bitcoin"
              className="mt-1"
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label className="text-xs text-slate-500">Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {investmentTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticker */}
          <div>
            <Label className="text-xs text-slate-500">
              {type === 'crypto' ? 'Cryptocurrency' : 'Ticker/Symbol'}
            </Label>
            {type === 'crypto' ? (
              <div className="space-y-2">
                <Select value={ticker} onValueChange={(value) => {
                  setTicker(value);
                  setLivePrice(null);
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoOptions.map(crypto => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        {crypto.symbol} - {crypto.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ticker && (
                  <Button
                    type="button"
                    onClick={fetchLivePrice}
                    disabled={fetchingPrice}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {fetchingPrice ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    Get Live Price
                  </Button>
                )}
                {livePrice && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Current: {currencySymbol}{livePrice.toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL, SPY"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={fetchLivePrice}
                  disabled={fetchingPrice || !ticker}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {fetchingPrice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Live Price
                    </>
                  )}
                </Button>
              </div>
            )}
            {type !== 'crypto' && livePrice && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                Current: {currencySymbol}{livePrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Cost Basis & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Cost Basis *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  value={costBasis}
                  onChange={(e) => handleCostBasisChange(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Total amount paid</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Quantity *</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="0"
                step="0.00000001"
                min="0"
                className="mt-1"
                required
              />
              {livePrice && costBasis && (
                <p className="text-xs text-emerald-600 mt-1">
                  Auto-calculated
                </p>
              )}
            </div>
          </div>

          {/* Current Value */}
          <div>
            <Label className="text-xs text-slate-500">Current Value *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {currencySymbol}
              </span>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-7 text-lg font-semibold"
                required
              />
            </div>
            {livePrice && quantity && (
              <p className="text-xs text-slate-500 mt-1">
                Auto-calculated from live price × quantity
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <Label className="text-xs text-slate-500">Purchase Date</Label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-slate-500">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              className="mt-1 h-20"
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
              {isLoading ? 'Saving...' : investment ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}