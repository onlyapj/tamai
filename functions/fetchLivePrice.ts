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

    // Fetch price based on type
    if (type === 'crypto') {
      // Cryptocurrency pricing
      const cryptoUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_symbol=${symbol}&to_symbol=USD&apikey=${apiKey}`;
      const cryptoRes = await fetch(cryptoUrl);
      const cryptoData = await cryptoRes.json();
      
      if (cryptoData['Realtime Currency Exchange Rate']) {
        price = parseFloat(cryptoData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
      }
    } else {
      // Stock, ETF, etc.
      const stockUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const stockRes = await fetch(stockUrl);
      const stockData = await stockRes.json();
      
      if (stockData['Global Quote'] && stockData['Global Quote']['05. price']) {
        price = parseFloat(stockData['Global Quote']['05. price']);
      }
    }

    if (price === null) {
      return Response.json({ 
        error: 'Unable to fetch price. Check ticker symbol.',
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