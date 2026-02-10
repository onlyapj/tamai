import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's teams
    const teams = await base44.asServiceRole.entities.Team.filter({
      owner_email: user.email,
    });

    if (teams.length === 0) {
      return Response.json({
        cashBalance: 0,
        revenue: 0,
        activeTasks: 0,
        teamMembers: 0,
        topPriorities: [],
        overdueTasks: [],
        goalsAtRisk: [],
        aiInsights: [],
      });
    }

    const primaryTeam = teams[0];

    // Fetch financial data (mock for now)
    const cashBalance = Math.floor(Math.random() * 50000) + 10000;
    const revenue = Math.floor(Math.random() * 100000) + 20000;

    // Fetch team members
    const members = await base44.asServiceRole.entities.TeamMember.filter({
      team_id: primaryTeam.id,
      status: 'active',
    });

    // Fetch shared projects
    const projects = await base44.asServiceRole.entities.SharedProject.filter({
      team_id: primaryTeam.id,
    });

    // Fetch goals
    const goals = await base44.asServiceRole.entities.Goal.filter({});

    // Calculate active tasks count
    const activeTasks = projects.reduce(
      (sum, p) => sum + (p.task_count - p.completed_tasks),
      0
    );

    // Mock AI insights
    const aiInsights = [
      {
        title: '⚠️ Expenses Increased',
        message: 'Your expenses increased 18% this month. Want me to find cost savings?',
        action: 'Analyze Spending',
      },
      {
        title: '📊 Task Bottleneck',
        message: '3 tasks are blocking your Q2 goal. Recommend reassigning them?',
        action: 'Fix Bottlenecks',
      },
      {
        title: '🚀 At Risk Goal',
        message: 'Based on trends, you\'ll miss this goal unless action is taken.',
        action: 'See Recovery Plan',
      },
    ];

    // Mock top priorities
    const topPriorities = projects.slice(0, 3).map((p, idx) => ({
      title: p.name,
      description: `${p.completed_tasks}/${p.task_count} tasks completed`,
      priority: ['high', 'medium', 'low'][idx % 3],
    }));

    // Mock overdue tasks
    const overdueTasks = [];
    if (projects.some((p) => p.status === 'in_progress')) {
      overdueTasks.push({
        title: 'Client Presentation Prep',
        owner: 'Sarah Chen',
        daysOverdue: 2,
      });
    }

    // Mock goals at risk
    const goalsAtRisk = goals
      .filter((g) => g.progress < 50 && g.status === 'active')
      .slice(0, 2)
      .map((g) => ({
        title: g.title,
        completion: Math.floor(g.progress),
        insight: `Tracking ${g.progress}% complete. Need to accelerate progress.`,
      }));

    return Response.json({
      cashBalance: `$${cashBalance.toLocaleString()}`,
      revenue: `$${revenue.toLocaleString()}`,
      activeTasks,
      teamMembers: members.length,
      topPriorities,
      overdueTasks,
      goalsAtRisk,
      aiInsights,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});