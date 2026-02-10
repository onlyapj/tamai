import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habit_id } = await req.json();

    if (!habit_id) {
      return Response.json({ error: 'habit_id required' }, { status: 400 });
    }

    // Fetch habit and its logs
    const habit = await base44.entities.Habit.list();
    const targetHabit = habit.find(h => h.id === habit_id);

    if (!targetHabit) {
      return Response.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Get last 60 days of logs
    const logs = await base44.entities.HabitLog.filter({ habit_id });
    const recent = logs.slice(-60);

    // Calculate stats
    const completionRate = targetHabit.completion_rate || 0;
    const currentStreak = targetHabit.current_streak || 0;
    const bestStreak = targetHabit.best_streak || 0;
    const daysActive = targetHabit.days_active || 0;

    // Analyze patterns
    const completedCount = recent.filter(l => l.completed).length;
    const trend = completedCount > recent.length * 0.5 ? 'improving' : 'declining';

    // Generate insights using LLM
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a habit formation expert. Analyze this habit's performance and provide 2-3 specific, actionable insights.
      
Habit: ${targetHabit.name}
Category: ${targetHabit.category}
Frequency: ${targetHabit.frequency}

Performance Metrics:
- Completion Rate: ${completionRate}%
- Current Streak: ${currentStreak} days
- Best Streak: ${bestStreak} days
- Days Active: ${daysActive}
- Recent Trend: ${trend}

Provide insights on:
1. What's working well
2. One area to improve
3. A specific recommendation to break through the next level

Keep it concise and motivational.`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'string' },
          improvement_area: { type: 'string' },
          recommendation: { type: 'string' },
          motivation: { type: 'string' }
        }
      }
    });

    return Response.json({
      habit: targetHabit,
      stats: {
        completionRate,
        currentStreak,
        bestStreak,
        daysActive,
        trend,
        completedDaysInPeriod: completedCount,
        totalDaysTracked: recent.length
      },
      insights
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});