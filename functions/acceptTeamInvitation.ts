import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_member_id } = await req.json();

    if (!team_member_id) {
      return Response.json({ error: 'Missing team_member_id' }, { status: 400 });
    }

    // Get the team member record
    const members = await base44.asServiceRole.entities.TeamMember.filter({ id: team_member_id });
    const teamMember = members[0];

    if (!teamMember) {
      return Response.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Verify the current user matches the invited email
    if (teamMember.user_email !== user.email) {
      return Response.json({ error: 'Invitation is for a different email' }, { status: 403 });
    }

    // Update status to active
    await base44.asServiceRole.entities.TeamMember.update(team_member_id, {
      status: 'active',
      joined_date: new Date().toISOString()
    });

    // Update team member count
    const teams = await base44.asServiceRole.entities.Team.filter({ id: teamMember.team_id });
    if (teams.length > 0) {
      await base44.asServiceRole.entities.Team.update(teams[0].id, {
        member_count: (teams[0].member_count || 1) + 1
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});