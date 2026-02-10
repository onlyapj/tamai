import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userMessage } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Missing userMessage' }, { status: 400 });
    }

    // Fetch all user data for context-aware responses
    const [habits, habitLogs, moodEntries, tasks, transactions, budgets, adhdProfiles, adhdLogs] = await Promise.all([
      base44.entities.Habit.list(),
      base44.entities.HabitLog.list('-date', 60),
      base44.entities.MoodEntry.list('-date', 30),
      base44.entities.Task.list('-due_date'),
      base44.entities.Transaction.list('-date', 30),
      base44.entities.Budget.list(),
      base44.asServiceRole.entities.ADHDProfile.filter({ created_by: user.email }),
      base44.asServiceRole.entities.ADHDLog.list('-date', 30)
    ]);

    // Calculate comprehensive user context
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.due_date === todayStr);
    const upcomingTasks = tasks.filter(t => t.due_date > todayStr && t.status !== 'completed').slice(0, 5);
    
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
    
    // Habit context
    const activeHabits = habits.filter(h => h.active);
    const incompleteTodayHabits = activeHabits.filter(habit => {
      const todayLog = habitLogs.find(l => l.habit_id === habit.id && l.date === todayStr);
      return !todayLog || !todayLog.completed;
    });

    // Mood context
    const recentMoods = moodEntries.slice(0, 7);
    const avgMood = recentMoods.length > 0 
      ? (recentMoods.reduce((s, m) => s + (m.mood_score || 0), 0) / recentMoods.length).toFixed(1)
      : 5;

    // Financial context
    const monthStr = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
    const monthSpending = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Check for ADHD profile
    const adhdProfile = adhdProfiles[0];
    let adhdContext = '';

    if (adhdProfile?.has_adhd && adhdLogs.length > 0) {
      const recentAdhdLogs = adhdLogs.slice(0, 7);
      const avgFocusScore = (recentAdhdLogs.reduce((s, l) => s + (l.focus_score || 5), 0) / recentAdhdLogs.length).toFixed(1);
      const avgSymptomSeverity = (recentAdhdLogs.reduce((s, l) => s + (l.symptom_severity || 5), 0) / recentAdhdLogs.length).toFixed(1);
      const avgEnergyLevel = (recentAdhdLogs.reduce((s, l) => s + (l.energy_level || 5), 0) / recentAdhdLogs.length).toFixed(1);

      adhdContext = `

USER HAS ADHD - SPECIAL CONSIDERATIONS:
- ADHD Type: ${adhdProfile.adhd_type}
- On medication: ${adhdProfile.is_medicated ? adhdProfile.medication_name : 'No'}
- Recent focus score: ${avgFocusScore}/10
- Symptom severity: ${avgSymptomSeverity}/10
- Energy level: ${avgEnergyLevel}/10
- Best focus time: ${adhdProfile.best_productivity_time}
- Typical focus window: ${adhdProfile.typical_focus_window} minutes
- Energy crash time: ${adhdProfile.energy_crash_time}

ADHD-Aware Coaching Principles:
- Break tasks into smaller, manageable steps
- Acknowledge executive function challenges without judgment
- Suggest dopamine-positive activities for rewards
- Recommend working in their peak focus windows
- Consider hyperfocus as an advantage for important tasks
- Suggest frequent breaks to manage energy crashes
- Avoid overloading with too many options`;
    }

    // Build contextual prompt for smarter responses
    const contextPrompt = `You are TAMAI, an intelligent personal assistant. You help users with productivity, wellness, finance, and habit tracking. Be conversational, smart, and provide actionable insights.${adhdContext}

Current User Context (use to make smart decisions):
- Name: ${user.full_name}
- Today's date: ${todayStr}
- Today's tasks: ${todayTasks.length} (${todayTasks.filter(t => t.status === 'completed').length} completed)
- High priority tasks: ${highPriorityTasks.length}
- Upcoming tasks this week: ${upcomingTasks.length}
- Total active habits: ${activeHabits.length}
- Incomplete habits today: ${incompleteTodayHabits.length}
- Recent mood: ${avgMood}/10 (${recentMoods.length} entries)
- This month spending: £${monthSpending.toFixed(2)}
- Overdue tasks: ${incompleteTasks.filter(t => new Date(t.due_date) < new Date()).length}

Recent Habits: ${activeHabits.slice(0, 5).map(h => h.name).join(', ') || 'None yet'}
Top Upcoming: ${upcomingTasks.slice(0, 3).map(t => t.title).join(', ') || 'Nothing scheduled'}

User Message: "${userMessage}"

Respond conversationally. If the user asks about:
- Tasks: Reference their current workload, suggest prioritization${adhdProfile?.has_adhd ? ', break into smaller steps' : ''}
- Habits: Connect to their mood/energy data, suggest timing
- Mood/wellness: Suggest habits that correlate with better mood
- Finance: Reference their spending patterns
- Productivity: Consider their energy levels and task load${adhdProfile?.has_adhd ? ', leverage hyperfocus windows' : ''}

Provide specific, actionable advice. If relevant, suggest specific actions they could take right now.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
      add_context_from_internet: true
    });

    // Parse response for recommendations
    const hasTaskRecommendation = response.toLowerCase().includes('task') || response.toLowerCase().includes('priorit');
    const hasHabitRecommendation = response.toLowerCase().includes('habit') || response.toLowerCase().includes('streak');
    const hasMoodConnection = response.toLowerCase().includes('mood') || response.toLowerCase().includes('energy');

    return Response.json({
      response,
      context: {
        todayTasks: todayTasks.length,
        completedToday: todayTasks.filter(t => t.status === 'completed').length,
        incompleteTodayHabits: incompleteTodayHabits.map(h => h.name),
        recentMood: avgMood,
        highPriorityCount: highPriorityTasks.length,
        hasTaskRecommendation,
        hasHabitRecommendation,
        hasMoodConnection
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});