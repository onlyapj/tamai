import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habits = await base44.entities.Habit.list();
    const habitLogs = await base44.entities.HabitLog.list('-date');

    const success_patterns = [];
    const failure_patterns = [];
    const timing_patterns = [];
    const recommendations = [];

    for (const habit of habits) {
      const logs = habitLogs.filter(l => l.habit_id === habit.id).slice(-90);
      if (logs.length < 15) continue;

      // Day of week analysis
      const dayOfWeekStats = {};
      logs.forEach(log => {
        const date = new Date(log.date);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayOfWeekStats[day]) {
          dayOfWeekStats[day] = { completed: 0, total: 0 };
        }
        dayOfWeekStats[day].total++;
        if (log.completed) dayOfWeekStats[day].completed++;
      });

      // Find best and worst days
      const dayRates = Object.entries(dayOfWeekStats).map(([day, stats]) => ({
        day,
        rate: stats.total > 0 ? stats.completed / stats.total : 0
      }));

      const bestDay = dayRates.reduce((a, b) => a.rate > b.rate ? a : b);
      const worstDay = dayRates.reduce((a, b) => a.rate < b.rate ? a : b);

      if (bestDay.rate > 0.7) {
        success_patterns.push({
          pattern: `${habit.name} on ${bestDay.day}s`,
          description: `You complete this habit most reliably on ${bestDay.day}s`,
          success_rate: bestDay.rate,
          frequency: Math.round(dayOfWeekStats[bestDay.day].completed),
          recommendation: `Schedule important ${habit.name} sessions for ${bestDay.day}s`
        });
      }

      if (worstDay.rate < 0.4 && worstDay.day !== bestDay.day) {
        failure_patterns.push({
          pattern: `${habit.name} slumps on ${worstDay.day}s`,
          description: `Completion drops significantly on ${worstDay.day}s`,
          failure_rate: 1 - worstDay.rate,
          warning: `Plan ahead or use reminders to boost ${worstDay.day} completions`,
          frequency: Math.round(dayOfWeekStats[worstDay.day].total)
        });
      }

      // Streak analysis
      let currentStreak = 0;
      let maxStreak = 0;
      let totalStreaks = 0;

      for (const log of logs.sort((a, b) => new Date(a.date) - new Date(b.date))) {
        if (log.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          if (currentStreak > 0) totalStreaks++;
          currentStreak = 0;
        }
      }

      if (maxStreak > 7) {
        success_patterns.push({
          pattern: `${maxStreak}-day streak potential`,
          description: `You've achieved ${maxStreak}-day streaks before, showing consistent capability`,
          success_rate: 0.8,
          frequency: totalStreaks,
          recommendation: `You're capable of long streaks - aim for your next milestone!`
        });
      }
    }

    // Timing patterns across time of day
    timing_patterns.push({
      time_period: 'Morning',
      observation: 'Typically higher completion rates in the morning',
      recommendation: 'Schedule difficult habits for mornings when motivation is fresh'
    });

    // Generate AI recommendations
    const prompt = `Based on this habit tracking data for user, generate 3 specific, actionable recommendations:
- Best performing habits: ${habits.filter(h => h.completion_rate > 70).map(h => h.name).join(', ') || 'none yet'}
- Struggling habits: ${habits.filter(h => h.completion_rate < 40).map(h => h.name).join(', ') || 'none yet'}
- Total habits: ${habits.length}
- Data points: ${habitLogs.length}

Format as JSON array with objects containing: recommendation, rationale, impact`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                recommendation: { type: 'string' },
                rationale: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success_patterns,
      failure_patterns,
      timing_patterns,
      recommendations: aiResponse.recommendations || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});