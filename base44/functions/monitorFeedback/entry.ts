import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check for high volume of negative feedback in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentFeedback = await base44.asServiceRole.entities.Feedback.list('-created_date', 100);
    
    const last24Hours = recentFeedback.filter(f => f.created_date >= oneDayAgo);
    const negativeFeedback = last24Hours.filter(f => f.rating === 'negative');
    
    const negativePercentage = last24Hours.length > 0 
      ? (negativeFeedback.length / last24Hours.length) * 100 
      : 0;

    // Alert if more than 30% negative feedback
    if (negativePercentage > 30 && negativeFeedback.length >= 3) {
      // Get all admin users
      const allUsers = await base44.asServiceRole.entities.User.list();
      const admins = allUsers.filter(u => u.role === 'admin');

      // Send notification to all admins
      for (const admin of admins) {
        const prefs = admin.notification_preferences || { admin_alerts: true };
        if (prefs.admin_alerts) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: admin.email,
            type: 'alert',
            category: 'feedback',
            title: 'High Volume of Negative Feedback',
            message: `${negativeFeedback.length} negative feedback submissions (${negativePercentage.toFixed(0)}%) in the last 24 hours.`,
            action_url: '/AdminFeedback'
          });
        }
      }
    }

    return Response.json({
      success: true,
      stats: {
        total_24h: last24Hours.length,
        negative: negativeFeedback.length,
        percentage: negativePercentage.toFixed(1)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});