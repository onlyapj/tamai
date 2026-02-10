import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { energy_level, symptom_severity } = body;

    if (energy_level === undefined || symptom_severity === undefined) {
      return Response.json({ error: 'Missing energy_level or symptom_severity' }, { status: 400 });
    }

    let focusType = 'neutral';
    let urgency = 'low';

    // Determine type and urgency
    if (energy_level <= 3 && symptom_severity >= 7) {
      focusType = 'energy_crash';
      urgency = 'high';
    } else if (energy_level <= 3) {
      focusType = 'low_energy';
      urgency = 'medium';
    } else if (symptom_severity >= 8) {
      focusType = 'symptom_overload';
      urgency = 'high';
    } else if (symptom_severity >= 6) {
      focusType = 'high_symptoms';
      urgency = 'medium';
    } else if (energy_level >= 8) {
      focusType = 'hyperfocus_ready';
      urgency = 'low';
    }

    const prompt = `You are an ADHD-aware wellness coach. Based on the user's current state, provide personalized interventions.

User's Current State:
- Energy Level: ${energy_level}/10
- Symptom Severity: ${symptom_severity}/10
- State Type: ${focusType}
- Urgency: ${urgency}

Generate a JSON response with:
1. "title": A catchy, encouraging title (5-8 words)
2. "type": Either "calming_break" or "focus_booster"
3. "duration_minutes": Recommended duration (5-20 minutes)
4. "activities": Array of 3-4 specific, quick activities the user can do right now
5. "explanation": Brief explanation why these help with their current state (1 sentence)
6. "emoji": A single emoji that represents this break type
7. "intensity": "low", "medium", or "high" based on urgency

For energy crashes: Suggest gentle, grounding activities (stretching, water, nature)
For symptom overload: Suggest sensory regulation (music, textures, breathing)
For hyperfocus ready: Suggest time-boxing and reward systems

Be specific, practical, and ADHD-aware. Activities should be doable in the suggested timeframe.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          type: { type: 'string', enum: ['calming_break', 'focus_booster'] },
          duration_minutes: { type: 'number' },
          activities: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
          emoji: { type: 'string' },
          intensity: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    });

    return Response.json({
      success: true,
      booster: {
        ...response,
        state: { energy_level, symptom_severity, type: focusType },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});