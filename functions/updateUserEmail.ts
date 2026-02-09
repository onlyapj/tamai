import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if email is already in use
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers.length > 0 && existingUsers[0].id !== user.id) {
      return Response.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Update user email
    await base44.asServiceRole.entities.User.update(user.id, { email });

    return Response.json({ success: true, message: 'Email updated successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});