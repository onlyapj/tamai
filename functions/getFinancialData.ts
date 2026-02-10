import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const timeframe = body.timeframe || 'month';

    // Mock financial data
    const mockData = {
      totalRevenue: '$125,400',
      totalExpenses: '$78,900',
      netIncome: '$46,500',
      runway: '8.2 months',
      chartData: [
        { month: 'Jan', revenue: 95000, expenses: 65000 },
        { month: 'Feb', revenue: 105000, expenses: 68000 },
        { month: 'Mar', revenue: 125400, expenses: 78900 },
      ],
      expenses: [
        { category: 'Salaries', percentage: 45 },
        { category: 'Software', percentage: 18 },
        { category: 'Marketing', percentage: 15 },
        { category: 'Infrastructure', percentage: 12 },
        { category: 'Other', percentage: 10 },
      ],
      anomalies: [
        {
          title: 'Unexpected Software Charge',
          description: '$3,200 charge from Adobe Creative Cloud (usually $400/mo)',
        },
        {
          title: 'High AWS Usage',
          description: 'March AWS bill is 25% higher than February. Check for orphaned resources.',
        },
      ],
      costSavings: [
        {
          title: 'Unused Subscriptions',
          description: 'You\'re spending $450/mo on tools no one is using.',
          amount: '450',
        },
        {
          title: 'Volume Discount',
          description: 'Switch hosting providers to save on bandwidth costs.',
          amount: '850',
        },
      ],
      recentTransactions: [
        {
          description: 'Stripe Processing Fees',
          category: 'Operating Expenses',
          type: 'expense',
          amount: '1,240',
          date: 'Today',
        },
        {
          description: 'Client Payment - Acme Corp',
          category: 'Income',
          type: 'income',
          amount: '8,500',
          date: 'Yesterday',
        },
        {
          description: 'AWS Infrastructure',
          category: 'Infrastructure',
          type: 'expense',
          amount: '3,200',
          date: '2 days ago',
        },
        {
          description: 'Slack Annual Plan',
          category: 'Software',
          type: 'expense',
          amount: '1,800',
          date: '3 days ago',
        },
      ],
    };

    return Response.json(mockData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});