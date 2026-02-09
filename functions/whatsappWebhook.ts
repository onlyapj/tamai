import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);

  // Webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 });
    }
    return Response.json({ error: 'Verification failed' }, { status: 403 });
  }

  // Handle incoming messages (POST request)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      
      // Extract message data
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      
      if (!message) {
        return Response.json({ status: 'no message' }, { status: 200 });
      }

      const from = message.from;
      const messageText = message.text?.body;
      const messageType = message.type;

      if (messageType !== 'text') {
        return Response.json({ status: 'unsupported message type' }, { status: 200 });
      }

      // Get or create conversation for this WhatsApp user
      const conversations = await base44.asServiceRole.agents.listConversations({
        agent_name: 'TAMAI'
      });

      let conversation = conversations.find(c => c.metadata?.whatsapp_user_id === from);

      if (!conversation) {
        conversation = await base44.asServiceRole.agents.createConversation({
          agent_name: 'TAMAI',
          metadata: {
            name: `WhatsApp: ${from}`,
            whatsapp_user_id: from
          }
        });
      }

      // Add user message to conversation
      await base44.asServiceRole.agents.addMessage(conversation, {
        role: 'user',
        content: messageText
      });

      // Wait for agent response
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get latest conversation with agent response
      const updatedConversation = await base44.asServiceRole.agents.getConversation(conversation.id);
      const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        // Send response via WhatsApp
        await base44.asServiceRole.functions.invoke('sendWhatsAppMessage', {
          to: from,
          message: lastMessage.content
        });
      }

      return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});