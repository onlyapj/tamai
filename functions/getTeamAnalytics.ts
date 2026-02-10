import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id } = await req.json();

    // Verify user is team member
    const teamMembers = await base44.entities.TeamMember.filter({
      team_id,
      user_email: user.email
    });

    if (teamMembers.length === 0) {
      return Response.json({ error: 'Not a team member' }, { status: 403 });
    }

    // Get team info
    const teams = await base44.asServiceRole.entities.Team.filter({ id: team_id });
    const team = teams[0];

    // Get all team members
    const members = await base44.asServiceRole.entities.TeamMember.filter({
      team_id,
      status: 'active'
    });

    // Get all team projects
    const projects = await base44.asServiceRole.entities.SharedProject.filter({
      team_id
    });

    // Get team-wide tasks
    const allTasks = await base44.asServiceRole.entities.Task.list();
    const teamProjectIds = projects.map(p => p.id);
    
    // Count completed tasks across projects
    const completedTasks = projects.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);
    const totalTasks = projects.reduce((sum, p) => sum + (p.task_count || 0), 0);

    // Get team member activity
    const memberStats = members.map(m => ({
      name: m.user_name,
      email: m.user_email,
      role: m.role,
      joined: m.joined_date
    }));

    return Response.json({
      team: {
        id: team.id,
        name: team.name,
        member_count: members.length,
        plan_type: team.plan_type
      },
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      members: memberStats
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});