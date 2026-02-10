import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data
    const habits = await base44.entities.Habit.list();
    const habitLogs = await base44.entities.HabitLog.list('-date');
    const moodEntries = await base44.entities.MoodEntry.list('-date');

    if (habitLogs.length < 20 || moodEntries.length < 10) {
      return Response.json({ correlations: [], habit_interactions: [] });
    }

    // Calculate mood correlation with each habit
    const correlations = [];

    for (const habit of habits) {
      const logs = habitLogs.filter(l => l.habit_id === habit.id).slice(-60);
      if (logs.length < 10) continue;

      // Get mood entries for same date range
      const logDates = logs.map(l => l.date);
      const moodsForDates = moodEntries.filter(m => logDates.includes(m.date));

      if (moodsForDates.length < 5) continue;

      // Calculate correlation with mood score
      let moodCorrelation = 0;
      let energyCorrelation = 0;

      for (let i = 0; i < Math.min(logs.length, moodsForDates.length); i++) {
        const logCompleted = logs[i].completed ? 1 : 0;
        const mood = moodsForDates[i];

        // Simple correlation calculation
        moodCorrelation += (logCompleted * mood.mood_score) / (logs.length * 10);
        energyCorrelation += (logCompleted * (mood.energy_level || 0)) / (logs.length * 10);
      }

      // Store correlations
      if (Math.abs(moodCorrelation) > 0.1) {
        correlations.push({
          habit_name: habit.name,
          correlation_type: 'mood',
          correlation: Math.min(Math.max(moodCorrelation, -1), 1),
          description: moodCorrelation > 0 ? 'Improves when habit is done' : 'Decreases when habit is done',
          samples: moodsForDates.length
        });
      }

      if (Math.abs(energyCorrelation) > 0.1) {
        correlations.push({
          habit_name: habit.name,
          correlation_type: 'energy',
          correlation: Math.min(Math.max(energyCorrelation, -1), 1),
          description: energyCorrelation > 0 ? 'Boosts energy' : 'Drains energy',
          samples: moodsForDates.length
        });
      }
    }

    // Analyze habit interactions
    const habit_interactions = [];
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const habit_a = habits[i];
        const habit_b = habits[j];

        const logsA = habitLogs.filter(l => l.habit_id === habit_a.id).slice(-30);
        const logsB = habitLogs.filter(l => l.habit_id === habit_b.id).slice(-30);

        if (logsA.length < 5 || logsB.length < 5) continue;

        // Check if both completed on same day
        const sameDayCompletions = logsA.filter(la =>
          logsB.some(lb => lb.date === la.date && lb.completed && la.completed)
        ).length;

        const coOccurrenceRate = sameDayCompletions / Math.min(logsA.length, logsB.length);

        if (coOccurrenceRate > 0.4) {
          habit_interactions.push({
            habit_a: habit_a.name,
            habit_b: habit_b.name,
            boost: coOccurrenceRate > 0.6,
            description: coOccurrenceRate > 0.6 ? 'These habits naturally synergize' : 'Often done together',
            co_occurrence: (coOccurrenceRate * 100).toFixed(0)
          });
        }
      }
    }

    return Response.json({
      correlations: correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
      habit_interactions: habit_interactions.sort((a, b) => b.co_occurrence - a.co_occurrence)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});