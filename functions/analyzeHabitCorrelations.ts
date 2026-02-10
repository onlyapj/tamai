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
    const moodEntries = await base44.entities.MoodEntry.list('-date');

    // Calculate habit-mood correlations
    const correlations = [];

    for (const habit of habits) {
      const habit_logs = habitLogs.filter(log => log.habit_id === habit.id && log.completed);

      if (habit_logs.length < 5) continue; // Need minimum data

      // Correlate with mood
      const moodOnHabitDays = moodEntries.filter(mood => {
        return habit_logs.some(log => log.date === mood.date);
      });

      if (moodOnHabitDays.length > 0) {
        const avgMoodOnHabitDays = moodOnHabitDays.reduce((sum, m) => sum + (m.mood_score || 0), 0) / moodOnHabitDays.length;
        const allMoodAvg = moodEntries.reduce((sum, m) => sum + (m.mood_score || 0), 0) / moodEntries.length;
        const moodCorrelation = (avgMoodOnHabitDays - allMoodAvg) / allMoodAvg;

        if (Math.abs(moodCorrelation) > 0.1) {
          correlations.push({
            habit_name: habit.name,
            correlation_type: 'mood',
            correlation: Math.min(1, Math.max(-1, moodCorrelation)),
            description: moodCorrelation > 0
              ? `Mood improves by ${Math.abs((moodCorrelation * 100).toFixed(0))}% on days you complete this`
              : `Mood decreases by ${Math.abs((moodCorrelation * 100).toFixed(0))}% on completion days`,
            sample_size: moodOnHabitDays.length
          });
        }
      }

      // Correlate with energy
      const energyOnHabitDays = moodEntries.filter(mood => {
        return habit_logs.some(log => log.date === mood.date);
      });

      if (energyOnHabitDays.length > 0) {
        const avgEnergyOnHabitDays = energyOnHabitDays.reduce((sum, m) => sum + (m.energy_level || 0), 0) / energyOnHabitDays.length;
        const allEnergyAvg = moodEntries.reduce((sum, m) => sum + (m.energy_level || 0), 0) / moodEntries.length;
        const energyCorrelation = (avgEnergyOnHabitDays - allEnergyAvg) / allEnergyAvg;

        if (Math.abs(energyCorrelation) > 0.1) {
          correlations.push({
            habit_name: habit.name,
            correlation_type: 'energy',
            correlation: Math.min(1, Math.max(-1, energyCorrelation)),
            description: energyCorrelation > 0
              ? `Energy increases by ${Math.abs((energyCorrelation * 100).toFixed(0))}% on days you complete this`
              : `Energy decreases by ${Math.abs((energyCorrelation * 100).toFixed(0))}% on completion days`,
            sample_size: energyOnHabitDays.length
          });
        }
      }
    }

    // Find synergistic habits
    const habit_interactions = [];

    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const habit_a_logs = habitLogs.filter(log => log.habit_id === habits[i].id && log.completed);
        const habit_b_logs = habitLogs.filter(log => log.habit_id === habits[j].id && log.completed);

        const both_completed = habit_a_logs.filter(log_a =>
          habit_b_logs.some(log_b => log_b.date === log_a.date)
        ).length;

        if (both_completed > 5) {
          const synergy = both_completed / Math.max(habit_a_logs.length, habit_b_logs.length);

          if (synergy > 0.5) {
            habit_interactions.push({
              habit_a: habits[i].name,
              habit_b: habits[j].name,
              boost: synergy > 0.7,
              description: `${habits[i].name} & ${habits[j].name} are often done together (${(synergy * 100).toFixed(0)}% co-completion)`,
              co_completion_rate: synergy
            });
          }
        }
      }
    }

    return Response.json({
      correlations: correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
      habit_interactions: habit_interactions.sort((a, b) => b.co_completion_rate - a.co_completion_rate)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});