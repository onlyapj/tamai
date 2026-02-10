import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function usePricePoller(investments, enabled = true, interval = 5000) {
  useEffect(() => {
    if (!enabled || !investments || investments.length === 0) return;

    const pollPrices = async () => {
      try {
        for (const investment of investments) {
          if (!investment.ticker) continue;

          const { data } = await base44.functions.invoke('fetchLivePrice', {
            ticker: investment.ticker,
            type: investment.type
          });

          if (data.price && data.price !== investment.current_value) {
            const newValue = data.price * investment.quantity;
            await base44.entities.Investment.update(investment.id, {
              current_value: newValue
            });
          }
        }
      } catch (error) {
        // Silent fail on background polls
      }
    };

    const timer = setInterval(pollPrices, interval);
    return () => clearInterval(timer);
  }, [investments, enabled, interval]);
}