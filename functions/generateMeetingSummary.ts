import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { task_id, meeting_title, meeting_date, notes, attendees = [] } = body;

    if (!notes || !meeting_title) {
      return Response.json({ error: 'Notes and meeting title required' }, { status: 400 });
    }

    // Use AI to generate structured summary with attendee detection and sentiment analysis
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional meeting analyzer. Analyze the following meeting notes and extract:
1. A concise 2-3 sentence summary
2. Key decisions made
3. Action items with owners and due dates (if mentioned)
4. Main discussion points
5. Detect attendees mentioned in the notes (names, roles)
6. Sentiment analysis of the meeting (positive, neutral, negative) with a brief explanation

Meeting Title: ${meeting_title}
Meeting Date: ${meeting_date}
Provided Attendees: ${attendees.length > 0 ? attendees.join(', ') : 'None provided'}

MEETING NOTES:
${notes}

Respond in JSON format with this structure:
{
  "summary": "...",
  "key_decisions": ["...", "..."],
  "discussion_points": ["...", "..."],
  "action_items": [
    {
      "action": "...",
      "owner": "...",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "detected_attendees": ["...", "..."],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "confidence": 0.0-1.0,
    "explanation": "..."
  }
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_decisions: { type: 'array', items: { type: 'string' } },
          discussion_points: { type: 'array', items: { type: 'string' } },
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                owner: { type: 'string' },
                due_date: { type: 'string' }
              }
            }
          },
          detected_attendees: { type: 'array', items: { type: 'string' } },
          sentiment: {
            type: 'object',
            properties: {
              overall: { type: 'string' },
              confidence: { type: 'number' },
              explanation: { type: 'string' }
            }
          }
        }
      }
    });

    const { key_decisions, action_items, discussion_points, summary, detected_attendees, sentiment } = aiResult;
    
    // Merge provided attendees with detected ones
    const finalAttendees = Array.from(new Set([
      ...attendees,
      ...(detected_attendees || [])
    ])).filter(Boolean);

    // Save summary to database
    const meetingSummary = await base44.entities.MeetingSummary.create({
      task_id,
      meeting_title,
      meeting_date,
      notes,
      summary: summary || '',
      key_decisions: key_decisions || [],
      action_items: action_items || [],
      discussion_points: discussion_points || [],
      attendees,
      generated_at: new Date().toISOString()
    });

    return Response.json(meetingSummary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});