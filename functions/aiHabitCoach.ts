import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habits = await base44.entities.Habit.list();
    const habitLogs = await base44.entities.HabitLog.list('-date', 180);
    const moodEntries = await base44.entities.MoodEntry.list('-date', 30);

    if (habits.length === 0) {
      return Response.json({
        message: "Let's get started! Create your first habit to receive personalized coaching.",
        tips: [],
        encouragement: '',
        nudges: []
      });
    }

    // Calculate habit stats
    const habitStats = habits.map(habit => {
      const logs = habitLogs.filter(l => l.habit_id === habit.id);
      const recentLogs = logs.slice(0, 30);
      const completionRate = recentLogs.length > 0
        ? (recentLogs.filter(l => l.completed).length / recentLogs.length) * 100
        : 0;

      return {
        name: habit.name,
        category: habit.category,
        completionRate: Math.round(completionRate),
        currentStreak: habit.current_streak || 0,
        bestStreak: habit.best_streak || 0,
        totalCompletions: habit.total_completions || 0,
        daysActive: habit.days_active || 0
      };
    });

    const moodAverage = moodEntries.length > 0
      ? moodEntries.reduce((sum, m) => sum + (m.mood_score || 0), 0) / moodEntries.length
      : 5;

    const energyAverage = moodEntries.length > 0
      ? moodEntries.reduce((sum, m) => sum + (m.energy_level || 0), 0) / moodEntries.length
      : 5;

    // Find strongest and weakest habits
    const strongest = habitStats.reduce((max, h) => h.completionRate > max.completionRate ? h : max, habitStats[0]);
    const weakest = habitStats.reduce((min, h) => h.completionRate < min.completionRate ? h : min, habitStats[0]);
    const improving = habitStats.filter(h => h.completionRate > 60 && h.currentStreak > 3);
    const struggling = habitStats.filter(h => h.completionRate < 40);

    const coachPrompt = `You are a supportive, personalized AI habit coach. Based on the user's habit data, provide:

User Habit Summary:
- Total habits: ${habits.length}
- Strongest habit: ${strongest.name} (${strongest.completionRate}% completion)
- Weakest habit: ${weakest.name} (${weakest.completionRate}% completion)
- Improving habits (60%+ and streak 3+): ${improving.map(h => h.name).join(', ') || 'none yet'}
- Struggling habits (<40%): ${struggling.map(h => h.name).join(', ') || 'none'}
- Recent mood average: ${moodAverage.toFixed(1)}/10
- Recent energy average: ${energyAverage.toFixed(1)}/10
- User name: ${user.full_name || 'friend'}

Detailed habit breakdown:
${habitStats.map(h => `- ${h.name} (${h.category}): ${h.completionRate}% completion rate, ${h.currentStreak} day streak, ${h.totalCompletions} total completions`).join('\n')}

Generate a JSON response with:
1. "encouragement": One brief, warm sentence of genuine encouragement (acknowledge their efforts, even if struggling)
2. "tips": Array of 2-3 specific, actionable tips based on their data patterns
3. "nudges": Array of 2-3 gentle, motivational nudges (not preachy) for habits they're struggling with

Focus on positive reinforcement, realistic goals, and genuine wellness support. Be warm and human.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: coachPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          encouragement: { type: 'string' },
          tips: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                relatedHabit: { type: 'string' }
              }
            }
          },
          nudges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                habit: { type: 'string' },
                message: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      encouragement: response.encouragement || '',
      tips: response.tips || [],
      nudges: response.nudges || [],
      stats: {
        totalHabits: habits.length,
        improvingCount: improving.length,
        strugglingCount: struggling.length,
        moodAverage: moodAverage.toFixed(1),
        energyAverage: energyAverage.toFixed(1)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});