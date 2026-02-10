import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const query = body.query?.toLowerCase() || '';

    // Use AI to respond to the query
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI Business Assistant for a company owner. Answer this business question concisely and actionable: "${query}". 
      
      Provide data-backed answers when possible. If you need to suggest actions, be specific and measurable.
      Keep responses to 2-3 sentences max.`,
      add_context_from_internet: false,
    });

    // Mock suggestions based on query
    let suggestions = [];
    if (
      query.includes('cash') ||
      query.includes('finance') ||
      query.includes('money')
    ) {
      suggestions = [
        'Reduce expenses',
        'Export report',
        'Explain this chart',
      ];
    } else if (
      query.includes('task') ||
      query.includes('work') ||
      query.includes('doing')
    ) {
      suggestions = [
        'Show overdue tasks',
        'Reassign work',
        'Find bottlenecks',
      ];
    } else if (
      query.includes('goal') ||
      query.includes('pace') ||
      query.includes('progress')
    ) {
      suggestions = [
        'Show at-risk goals',
        'Get recovery plan',
        'Adjust timeline',
      ];
    } else if (
      query.includes('team') ||
      query.includes('people') ||
      query.includes('capacity')
    ) {
      suggestions = [
        'Who\'s overloaded?',
        'Team health report',
        'Hire recommendations',
      ];
    }

    return Response.json({
      response: aiResponse,
      actions: ['Learn more', 'Take action'],
      suggestions,
    });
  } catch (error) {
    return Response.json({
      response: 'I encountered an error processing your question. Please try again.',
      error: error.message,
    }, { status: 500 });
  }
});