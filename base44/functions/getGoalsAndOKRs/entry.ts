import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock goals and OKRs
    const goals = [
      {
        id: '1',
        title: 'Increase Revenue by 20%',
        description: 'Grow ARR from $500K to $600K',
        status: 'active',
        progress: 45,
        expectedProgress: 58,
        targetDate: 'Jun 30, 2026',
        keyResults: [
          { title: 'Close 5 enterprise deals', progress: 60 },
          { title: 'Grow MRR by 15%', progress: 38 },
          { title: 'Reduce churn to <2%', progress: 45 },
        ],
        aiInsight: 'You\'re 13% behind pace. Recommend accelerating sales outreach.',
        nextActions: [
          'Schedule demos with 10 qualified leads',
          'Launch pricing experiment',
          'Analyze churn drivers',
        ],
      },
      {
        id: '2',
        title: 'Ship Q2 Product Roadmap',
        description: 'Complete 8 major features',
        status: 'at_risk',
        progress: 32,
        expectedProgress: 50,
        targetDate: 'Jun 30, 2026',
        keyResults: [
          { title: 'API v2 complete', progress: 75 },
          { title: 'Dashboard redesign', progress: 20 },
          { title: 'Analytics module', progress: 15 },
        ],
        aiInsight: 'Dashboard redesign is blocked. Marcus is overloaded. Recommend reassigning.',
        nextActions: [
          'Unblock dashboard design',
          'Redistribute tasks to Alex',
          'Add contractor support',
        ],
      },
      {
        id: '3',
        title: 'Build High-Performing Team',
        description: 'Hire 3 engineers, 1 marketer',
        status: 'active',
        progress: 50,
        expectedProgress: 50,
        targetDate: 'Sep 30, 2026',
        keyResults: [
          { title: 'Hire 2 engineers', progress: 50 },
          { title: 'Hire 1 marketer', progress: 0 },
          { title: 'Improve team NPS to 8+', progress: 65 },
        ],
        aiInsight: 'On track. Consider starting marketing hire search early.',
        nextActions: [
          'Schedule final interviews for 2 engineers',
          'Post marketer job description',
          'Plan team offsite',
        ],
      },
      {
        id: '4',
        title: 'Achieve Unit Economics Target',
        description: 'CAC payback < 12 months',
        status: 'completed',
        progress: 100,
        expectedProgress: 100,
        targetDate: 'Mar 31, 2026',
        keyResults: [
          { title: 'Reduce CAC to $5K', progress: 100 },
          { title: 'Improve LTV to $60K', progress: 100 },
        ],
      },
    ];

    return Response.json(goals);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});