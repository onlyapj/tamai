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
    const transactions = await base44.entities.Transaction.list('-date');

    // Analyze success patterns
    const success_patterns = [];
    const failure_patterns = [];
    const timing_patterns = [];

    for (const habit of habits) {
      const logs = habitLogs.filter(log => log.habit_id === habit.id);
      if (logs.length < 10) continue;

      const completed = logs.filter(l => l.completed);
      const successRate = completed.length / logs.length;

      // Day of week analysis
      const dayStats = {};
      for (let day = 0; day < 7; day++) {
        dayStats[day] = { completed: 0, total: 0 };
      }

      completed.forEach(log => {
        const date = new Date(log.date);
        const dayOfWeek = date.getDay();
        dayStats[dayOfWeek].completed++;
      });

      logs.forEach(log => {
        const date = new Date(log.date);
        const dayOfWeek = date.getDay();
        dayStats[dayOfWeek].total++;
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const bestDay = Object.entries(dayStats)
        .filter(([, stats]) => stats.total > 0)
        .reduce((best, [day, stats]) => {
          const rate = stats.completed / stats.total;
          return rate > (best.rate || 0) ? { day, rate, ...stats } : best;
        }, {});

      const worstDay = Object.entries(dayStats)
        .filter(([, stats]) => stats.total > 0)
        .reduce((worst, [day, stats]) => {
          const rate = stats.completed / stats.total;
          return rate < (worst.rate || 1) ? { day, rate, ...stats } : worst;
        }, {});

      if (bestDay.day !== undefined) {
        const bestDayRate = bestDay.completed / bestDay.total;
        if (bestDayRate > successRate + 0.15) {
          success_patterns.push({
            pattern: `${habit.name} succeeds on ${dayNames[bestDay.day]}s`,
            description: `You're ${((bestDayRate * 100) - (successRate * 100)).toFixed(0)}% more likely to complete this on ${dayNames[bestDay.day]}`,
            success_rate: bestDayRate,
            frequency: bestDay.completed,
            habit_id: habit.id
          });
        }
      }

      if (worstDay.day !== undefined) {
        const worstDayRate = worstDay.completed / worstDay.total;
        if (worstDayRate < successRate - 0.15) {
          failure_patterns.push({
            pattern: `${habit.name} struggles on ${dayNames[worstDay.day]}s`,
            description: `You complete this ${Math.round(((successRate - worstDayRate) * 100))}% less on ${dayNames[worstDay.day]}`,
            failure_rate: 1 - worstDayRate,
            warning: `Consider scheduling a reminder or alternative on ${dayNames[worstDay.day]}`,
            habit_id: habit.id
          });
        }
      }

      // Time-based patterns
      const lastWeekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      });

      if (lastWeekLogs.length > 0) {
        const weekCompleted = lastWeekLogs.filter(l => l.completed).length;
        const weekRate = weekCompleted / lastWeekLogs.length;

        if (weekRate > successRate + 0.2) {
          timing_patterns.push({
            time_period: `Last 7 days: ${habit.name}`,
            observation: `You're on fire! ${(weekRate * 100).toFixed(0)}% completion this week.`,
            recommendation: 'Keep momentum - this is your best week'
          });
        } else if (weekRate < successRate - 0.2) {
          timing_patterns.push({
            time_period: `Last 7 days: ${habit.name}`,
            observation: `Completion dropped to ${(weekRate * 100).toFixed(0)}% this week.`,
            recommendation: 'Reset and refocus - consider why your routine changed'
          });
        }
      }
    }

    // Generate AI recommendations
    const recommendations = [];

    if (success_patterns.length > 0) {
      recommendations.push({
        recommendation: 'Leverage your best days',
        rationale: `You have ${success_patterns.length} habits that perform better on specific days. Schedule important tasks on your peak days.`,
        impact: '+15-20% completion rate'
      });
    }

    if (failure_patterns.length > 0) {
      recommendations.push({
        recommendation: 'Fix your weak days',
        rationale: `You struggle on certain days. Consider habit stacking (pairing with an existing routine) or changing the time on these days.`,
        impact: '+10-15% completion rate'
      });
    }

    // Analyze external factors
    const recentMood = moodEntries.slice(-30);
    const recentLogs = habitLogs.filter(log => {
      const logDate = new Date(log.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    });

    if (recentMood.length > 10 && recentLogs.length > 10) {
      const avgMood = recentMood.reduce((sum, m) => sum + (m.mood_score || 0), 0) / recentMood.length;
      const avgCompletion = recentLogs.filter(l => l.completed).length / recentLogs.length;

      if (avgMood < 5) {
        recommendations.push({
          recommendation: 'Start small during low moods',
          rationale: 'Your mood has been lower lately. Reduce habit difficulty during these periods to maintain progress.',
          impact: 'Better long-term consistency'
        });
      }
    }

    if (recommendations.length < 3) {
      recommendations.push({
        recommendation: 'Build streak awareness',
        rationale: 'Focus on not breaking the chain. Even a small daily action maintains momentum better than sporadic effort.',
        impact: 'Better habit retention'
      });
    }

    return Response.json({
      success_patterns: success_patterns.slice(0, 5),
      failure_patterns: failure_patterns.slice(0, 5),
      timing_patterns: timing_patterns.slice(0, 3),
      recommendations: recommendations.slice(0, 3)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});