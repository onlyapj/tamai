import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's recent data
    const [moodEntries, habits, healthLogs] = await Promise.all([
      base44.entities.MoodEntry.list('-date', 30),
      base44.entities.Habit.filter({ active: true }),
      base44.entities.HealthLog.list('-date', 30)
    ]);

    // Prepare data for LLM analysis
    const analysisPrompt = `
      Based on this user's wellness data from the last 30 days, generate 3-5 personalized wellness recommendations.
      
      Recent Mood Entries (last 7 days):
      ${JSON.stringify(moodEntries.slice(0, 7), null, 2)}
      
      Active Habits:
      ${JSON.stringify(habits, null, 2)}
      
      Health Logs (last 7 days):
      ${JSON.stringify(healthLogs.slice(0, 7), null, 2)}
      
      Please return a JSON array with the following structure for each recommendation:
      {
        "type": "mood|sleep|exercise|stress|habit|general",
        "title": "brief title",
        "description": "detailed recommendation",
        "reason": "why based on data",
        "priority": "low|medium|high",
        "action_items": ["action 1", "action 2"]
      }
      
      Focus on actionable, personalized insights based on patterns in their data.
    `;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" },
                action_items: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Store recommendations
    const recommendations = (response.recommendations || []).map(rec => ({
      ...rec,
      generated_date: new Date().toISOString()
    }));

    if (recommendations.length > 0) {
      await base44.asServiceRole.entities.WellnessRecommendation.bulkCreate(recommendations);
    }

    return Response.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});