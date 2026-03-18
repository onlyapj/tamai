import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock project tasks
    const tasks = [
      {
        id: '1',
        title: 'Design new landing page',
        description: 'Create mockups and wireframes for the redesign',
        status: 'in_progress',
        priority: 'high',
        owner: 'Sarah Chen',
        dueDate: 'Mar 15',
        isOverdue: false,
        blockingCount: 0,
      },
      {
        id: '2',
        title: 'API integration with Stripe',
        description: 'Set up payment processing',
        status: 'pending',
        priority: 'high',
        owner: 'Marcus Lee',
        dueDate: 'Mar 10',
        isOverdue: true,
        blockingCount: 3,
      },
      {
        id: '3',
        title: 'User documentation',
        description: 'Write guides for new features',
        status: 'pending',
        priority: 'medium',
        owner: 'Elena Rodriguez',
        dueDate: 'Mar 20',
        isOverdue: false,
        blockingCount: 0,
      },
      {
        id: '4',
        title: 'Security audit',
        description: 'Conduct penetration testing',
        status: 'pending',
        priority: 'high',
        owner: 'David Kim',
        dueDate: 'Mar 25',
        isOverdue: false,
        blockingCount: 0,
      },
      {
        id: '5',
        title: 'Email campaign setup',
        description: 'Create and schedule Q2 campaigns',
        status: 'completed',
        priority: 'medium',
        owner: 'Lisa Wong',
        dueDate: 'Mar 8',
        isOverdue: false,
        blockingCount: 0,
      },
    ];

    return Response.json(tasks);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});