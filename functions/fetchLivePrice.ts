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
          const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data[coinId]) {
            price = data[coinId].usd;
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