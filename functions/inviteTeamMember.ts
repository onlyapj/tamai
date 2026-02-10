import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, invite_email, role } = await req.json();

    if (!team_id || !invite_email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is team admin
    const teamMembers = await base44.entities.TeamMember.filter({
      team_id,
      user_email: user.email
    });

    const currentMember = teamMembers[0];
    if (!currentMember || currentMember.role !== 'admin') {
      return Response.json({ error: 'Only admins can invite members' }, { status: 403 });
    }

    // Check if user already invited/member
    const existingMembers = await base44.entities.TeamMember.filter({
      team_id,
      user_email: invite_email
    });

    if (existingMembers.length > 0) {
      return Response.json({ error: 'User already part of team' }, { status: 400 });
    }

    // Create team member invitation
    const teamMember = await base44.entities.TeamMember.create({
      team_id,
      user_email: invite_email,
      role,
      status: 'invited',
      invited_date: new Date().toISOString()
    });

    // Send invitation email
    await base44.integrations.Core.SendEmail({
      to: invite_email,
      subject: 'You\'ve been invited to join a team on TAMAI',
      body: `You've been invited to join a team on TAMAI. Log in to accept the invitation.`
    });

    return Response.json({ 
      success: true, 
      member_id: teamMember.id 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});