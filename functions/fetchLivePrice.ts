import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker, type } = await req.json();

    if (!ticker) {
      return Response.json({ error: 'Ticker required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    let price = null;
    let symbol = ticker.toUpperCase();
    
    // Determine target currency from user preference
    const userCurrency = user?.currency || 'USD';
    const currencyCode = userCurrency === 'GBP' ? 'gbp' : userCurrency === 'EUR' ? 'eur' : 'usd';

    // For crypto, use CoinGecko API (free, no key needed)
    if (type === 'crypto') {
      try {
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
        
        const coinId = cryptoMap[symbol];
        if (coinId) {
          const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currencyCode}`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data[coinId] && data[coinId][currencyCode]) {
            price = data[coinId][currencyCode];
          }
        }
      } catch (error) {
        console.error('CoinGecko error:', error.message);
      }
    } else {
      // Stock, ETF using Alpha Vantage
      const stockUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const stockRes = await fetch(stockUrl);
      const stockData = await stockRes.json();
      
      if (stockData['Global Quote'] && stockData['Global Quote']['05. price']) {
        price = parseFloat(stockData['Global Quote']['05. price']);
        
        // Convert stock price from USD to user's currency if needed
        if (userCurrency !== 'USD') {
          try {
            const exchangeUrl = `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd,${currencyCode}`;
            const exchangeRes = await fetch(exchangeUrl);
            const exchangeData = await exchangeRes.json();
            
            if (exchangeData['usd-coin'] && exchangeData['usd-coin']['usd'] && exchangeData['usd-coin'][currencyCode]) {
              const usdPrice = exchangeData['usd-coin']['usd'];
              const targetPrice = exchangeData['usd-coin'][currencyCode];
              const exchangeRate = targetPrice / usdPrice;
              price = price * exchangeRate;
            }
          } catch (error) {
            console.error('Exchange rate fetch error:', error.message);
            // Return USD price if conversion fails
          }
        }
      }
    }

    if (price === null) {
      return Response.json({ 
        error: 'Unable to fetch price',
        ticker: symbol
      }, { status: 404 });
    }

    return Response.json({ 
      ticker: symbol,
      price,
      type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});