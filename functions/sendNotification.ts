import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipient_email, type, category, title, message, action_url } = await req.json();

    if (!recipient_email || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check recipient's notification preferences
    const recipients = await base44.asServiceRole.entities.User.filter({ email: recipient_email });
    if (recipients.length === 0) {
      return Response.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const recipient = recipients[0];
    const prefs = recipient.notification_preferences || {};

    // Check if this category is enabled
    const categoryMap = {
      'tamai': 'tamai_updates',
      'task': 'task_reminders',
      'system': 'system_alerts',
      'feedback': 'feedback_responses',
      'user_management': 'admin_alerts'
    };

    const prefKey = categoryMap[category];
    if (prefKey && prefs[prefKey] === false) {
      return Response.json({ 
        success: true, 
        skipped: true,
        reason: 'User has disabled this notification category' 
      });
    }

    // Create notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email,
      type: type || 'info',
      category: category || 'system',
      title,
      message,
      action_url
    });

    return Response.json({ success: true, notification });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});