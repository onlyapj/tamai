import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, subDays } from 'npm:date-fns';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.truelayer_access_token) {
      return Response.json({ error: 'Bank not connected' }, { status: 401 });
    }

    const clientId = Deno.env.get("TRUELAYER_CLIENT_ID");
    const clientSecret = Deno.env.get("TRUELAYER_CLIENT_SECRET");

    // Get accounts
    const accountsResponse = await fetch('https://api.truelayer.com/data/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${user.truelayer_access_token}`
      }
    });

    if (!accountsResponse.ok) {
      // Token might be expired, try to refresh
      if (user.truelayer_refresh_token) {
        const refreshResponse = await fetch('https://auth.truelayer.com/connect/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: user.truelayer_refresh_token
          })
        });

        const newTokens = await refreshResponse.json();
        if (newTokens.access_token) {
          await base44.auth.updateMe({
            truelayer_access_token: newTokens.access_token,
            truelayer_refresh_token: newTokens.refresh_token
          });
          
          // Retry with new token
          return Response.redirect(req.url);
        }
      }
      return Response.json({ error: 'Failed to fetch accounts' }, { status: 400 });
    }

    const { results: accounts } = await accountsResponse.json();
    
    let totalImported = 0;

    // Fetch transactions from last 90 days for each account
    for (const account of accounts) {
      const from = format(subDays(new Date(), 90), 'yyyy-MM-dd');
      const to = format(new Date(), 'yyyy-MM-dd');

      const transactionsResponse = await fetch(
        `https://api.truelayer.com/data/v1/accounts/${account.account_id}/transactions?from=${from}&to=${to}`,
        {
          headers: {
            'Authorization': `Bearer ${user.truelayer_access_token}`
          }
        }
      );

      const { results: transactions } = await transactionsResponse.json();

      // Import transactions
      for (const txn of transactions) {
        const amount = Math.abs(txn.amount);
        const type = txn.amount > 0 ? 'income' : 'expense';
        
        // Check if transaction already exists
        const existing = await base44.asServiceRole.entities.Transaction.filter({
          bank_transaction_id: txn.transaction_id
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.Transaction.create({
            amount,
            type,
            category: categorizeTxn(txn.description),
            description: txn.description,
            date: txn.timestamp.split('T')[0],
            bank_transaction_id: txn.transaction_id,
            created_by: user.email
          });
          totalImported++;
        }
      }
    }

    return Response.json({ 
      success: true, 
      imported: totalImported,
      accounts: accounts.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function categorizeTxn(description) {
  const desc = description.toLowerCase();
  if (desc.includes('supermarket') || desc.includes('tesco') || desc.includes('sainsbury')) return 'food';
  if (desc.includes('rent') || desc.includes('mortgage')) return 'housing';
  if (desc.includes('transport') || desc.includes('uber') || desc.includes('train')) return 'transport';
  if (desc.includes('electricity') || desc.includes('gas') || desc.includes('water')) return 'utilities';
  if (desc.includes('gym') || desc.includes('cinema') || desc.includes('netflix')) return 'entertainment';
  if (desc.includes('salary') || desc.includes('payment received')) return 'income';
  return 'other';
}