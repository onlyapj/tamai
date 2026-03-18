import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all investments for the user
    const investments = await base44.entities.Investment.filter({ created_by: user.email });
    
    if (!investments || investments.length === 0) {
      return Response.json({ updated: 0, message: 'No investments found' });
    }

    const userCurrency = user?.currency || 'USD';
    const currencyCode = userCurrency === 'GBP' ? 'gbp' : userCurrency === 'EUR' ? 'eur' : 'usd';
    
    let updatedCount = 0;

    for (const investment of investments) {
      if (!investment.ticker || !investment.quantity) continue;

      const ticker = investment.ticker.toUpperCase();
      let newPrice = null;

      // Fetch price based on investment type
      try {
        if (investment.type === 'crypto') {
          const cryptoMap = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum', 
            'SOL': 'solana',
            'ADA': 'cardano',
            'XRP': 'ripple',
            'DOGE': 'dogecoin',
            'USDT': 'tether',
            'BNB': 'binancecoin',
            'USDC': 'usd-coin',
            'TRX': 'tron',
            'AVAX': 'avalanche-2',
            'SHIB': 'shiba-inu',
            'DOT': 'polkadot',
            'LINK': 'chainlink',
            'MATIC': 'matic-network'
          };
          
          const coinId = cryptoMap[ticker];
          if (coinId) {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currencyCode}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data[coinId] && data[coinId][currencyCode]) {
              newPrice = data[coinId][currencyCode];
            }
          }
        } else {
          // Stock/ETF - fetch in USD then convert
          const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
          if (apiKey) {
            const stockUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
            const stockRes = await fetch(stockUrl);
            const stockData = await stockRes.json();
            
            if (stockData['Global Quote'] && stockData['Global Quote']['05. price']) {
              newPrice = parseFloat(stockData['Global Quote']['05. price']);
              
              // Convert to user's currency if needed
              if (userCurrency !== 'USD') {
                try {
                  const exchangeUrl = `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd,${currencyCode}`;
                  const exchangeRes = await fetch(exchangeUrl);
                  const exchangeData = await exchangeRes.json();
                  
                  if (exchangeData['usd-coin'] && exchangeData['usd-coin']['usd'] && exchangeData['usd-coin'][currencyCode]) {
                    const usdPrice = exchangeData['usd-coin']['usd'];
                    const targetPrice = exchangeData['usd-coin'][currencyCode];
                    const exchangeRate = targetPrice / usdPrice;
                    newPrice = newPrice * exchangeRate;
                  }
                } catch (error) {
                  console.error('Exchange rate error:', error.message);
                }
              }
            }
          }
        }

        // If we got a new price, update the current value
        if (newPrice !== null) {
          const newValue = newPrice * investment.quantity;
          
          // Only update if value changed
          if (Math.abs(newValue - investment.current_value) > 0.01) {
            await base44.entities.Investment.update(investment.id, {
              current_value: parseFloat(newValue.toFixed(2))
            });
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error updating ${ticker}:`, error.message);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return Response.json({ 
      updated: updatedCount,
      total: investments.length,
      message: `Updated ${updatedCount} out of ${investments.length} investments`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});