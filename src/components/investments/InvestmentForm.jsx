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

const stockOptions = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'KO', name: 'Coca-Cola' },
  { symbol: 'DIS', name: 'Disney' },
  { symbol: 'SPY', name: 'S&P 500 ETF' }
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

  // Real-time price updates every 30 seconds
  React.useEffect(() => {
    if (!ticker || !livePrice) return;
    
    const interval = setInterval(async () => {
      try {
        const { data } = await base44.functions.invoke('fetchLivePrice', { 
          ticker: ticker.trim(),
          type 
        });
        setLivePrice(data.price);
        
        // Update current value based on quantity
        if (quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0) {
          const newValue = data.price * parseFloat(quantity);
          setCurrentValue(newValue.toFixed(2));
        }
      } catch (error) {
        // Silent fail on background updates
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [ticker, type, quantity, livePrice]);

  const fetchLivePrice = async () => {
    if (!ticker || !ticker.trim()) {
      toast.error('Select a crypto first');
      return;
    }

    setFetchingPrice(true);
    try {
      const { data } = await base44.functions.invoke('fetchLivePrice', { 
        ticker: ticker.trim(),
        type 
      });
      
      setLivePrice(data.price);
      toast.success(`${ticker} price: ${currencySymbol}${data.price.toLocaleString()}`);
    } catch (error) {
      toast.error('Failed to fetch price');
      setLivePrice(null);
    } finally {
      setFetchingPrice(false);
    }
  };

  // When quantity is entered, calculate cost basis from live price
  const handleQuantityChange = async (value) => {
    setQuantity(value);
    
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) return;
    
    // If we have live price, calculate immediately
    if (livePrice) {
      const calculatedCostBasis = livePrice * parseFloat(value);
      setCostBasis(calculatedCostBasis.toFixed(2));
      setCurrentValue(calculatedCostBasis.toFixed(2));
    }
    // Otherwise fetch price first if ticker exists
    else if (ticker && ticker.trim()) {
      setFetchingPrice(true);
      try {
        const { data } = await base44.functions.invoke('fetchLivePrice', { 
          ticker: ticker.trim(),
          type 
        });
        setLivePrice(data.price);
        
        const calculatedCostBasis = data.price * parseFloat(value);
        setCostBasis(calculatedCostBasis.toFixed(2));
        setCurrentValue(calculatedCostBasis.toFixed(2));
      } catch (error) {
        toast.error('Failed to fetch price');
      } finally {
        setFetchingPrice(false);
      }
    }
  };

  // When cost basis is entered, calculate quantity from live price
  const handleCostBasisChange = async (value) => {
    setCostBasis(value);
    
    // Clear fields if value is empty
    if (!value || value === '') {
      setQuantity('');
      setCurrentValue('');
      return;
    }
    
    const costAmount = parseFloat(value);
    if (isNaN(costAmount) || costAmount <= 0) {
      setQuantity('');
      setCurrentValue('');
      return;
    }
    
    // Must have a ticker selected
    if (!ticker || !ticker.trim()) {
      toast.error('Select a cryptocurrency first');
      return;
    }
    
    // If we have live price, calculate immediately
    if (livePrice) {
      const calculatedQuantity = costAmount / livePrice;
      setQuantity(calculatedQuantity.toFixed(8));
      setCurrentValue(costAmount.toFixed(2));
      toast.success(`${calculatedQuantity.toFixed(8)} ${ticker} @ ${currencySymbol}${livePrice.toLocaleString()}`);
      return;
    }
    
    // Fetch price if we don't have it
    setFetchingPrice(true);
    try {
      const { data } = await base44.functions.invoke('fetchLivePrice', { 
        ticker: ticker.trim(),
        type 
      });
      setLivePrice(data.price);
      
      const calculatedQuantity = costAmount / data.price;
      setQuantity(calculatedQuantity.toFixed(8));
      setCurrentValue(costAmount.toFixed(2));
      toast.success(`${calculatedQuantity.toFixed(8)} ${ticker} @ ${currencySymbol}${data.price.toLocaleString()}`);
    } catch (error) {
      toast.error('Failed to fetch price - check ticker symbol');
      setQuantity('');
      setCurrentValue('');
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!quantity || !currentValue) {
      toast.error('Please enter investment amount to calculate tokens');
      return;
    }
    
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
                <div className="flex gap-2">
                  <Select value={ticker} onValueChange={(value) => {
                    setTicker(value);
                    setName(`${cryptoOptions.find(c => c.symbol === value)?.name || value}`);
                    setLivePrice(null);
                    setQuantity('');
                    setCurrentValue('');
                  }}>
                    <SelectTrigger className="mt-1 flex-1">
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
                  <Button
                    type="button"
                    onClick={fetchLivePrice}
                    disabled={fetchingPrice || !ticker}
                    variant="outline"
                    size="sm"
                    className="mt-1 whitespace-nowrap"
                  >
                    {fetchingPrice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Get Price
                      </>
                    )}
                  </Button>
                </div>
                {livePrice && (
                  <div className="bg-emerald-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-emerald-600 font-medium">
                      Live Price: {currencySymbol}{livePrice.toLocaleString()}
                    </p>
                    {quantity && (
                      <p className="text-xs text-slate-600">
                        You own: {parseFloat(quantity).toFixed(8)} {ticker}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={ticker} onValueChange={(value) => {
                    setTicker(value);
                    setName(`${stockOptions.find(s => s.symbol === value)?.name || value}`);
                    setLivePrice(null);
                    setQuantity('');
                    setCurrentValue('');
                  }}>
                    <SelectTrigger className="mt-1 flex-1">
                      <SelectValue placeholder="Select stock or ETF" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockOptions.map(stock => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={fetchLivePrice}
                    disabled={fetchingPrice || !ticker}
                    variant="outline"
                    size="sm"
                    className="mt-1 whitespace-nowrap"
                  >
                    {fetchingPrice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Get Price
                      </>
                    )}
                  </Button>
                </div>
                {livePrice && (
                  <div className="bg-emerald-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-emerald-600 font-medium">
                      Live Price: {currencySymbol}{livePrice.toLocaleString()}
                    </p>
                    {quantity && (
                      <p className="text-xs text-slate-600">
                        You own: {parseFloat(quantity).toFixed(2)} shares
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {type !== 'crypto' && livePrice && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                Current: {currencySymbol}{livePrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Cost Basis */}
          <div>
            <Label className="text-xs text-slate-500">Amount Invested *</Label>
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
                className="pl-7 text-lg font-semibold"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">How much money you invested</p>
          </div>

          {/* Quantity - Auto-calculated */}
          {quantity && livePrice && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <Label className="text-xs text-indigo-600 font-medium">Tokens Owned</Label>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                {parseFloat(quantity).toFixed(8)} {ticker}
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                @ {currencySymbol}{livePrice.toLocaleString()} per token
              </p>
            </div>
          )}

          {/* Current Value */}
          {currentValue && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <Label className="text-xs text-emerald-600 font-medium">Current Value</Label>
              <p className="text-3xl font-bold text-emerald-900 mt-1">
                {currencySymbol}{parseFloat(currentValue).toLocaleString()}
              </p>
              {costBasis && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${
                    parseFloat(currentValue) >= parseFloat(costBasis) 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {parseFloat(currentValue) >= parseFloat(costBasis) ? '↑' : '↓'} 
                    {currencySymbol}{Math.abs(parseFloat(currentValue) - parseFloat(costBasis)).toLocaleString()} 
                    ({((parseFloat(currentValue) - parseFloat(costBasis)) / parseFloat(costBasis) * 100).toFixed(2)}%)
                  </span>
                </div>
              )}
              <p className="text-xs text-emerald-600 mt-1">Updates in real-time</p>
            </div>
          )}

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