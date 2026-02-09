import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await base44.auth.me(); // Verify authentication

    const { to, message } = await req.json();

    if (!to || !message) {
      return Response.json({ error: 'Missing to or message' }, { status: 400 });
    }

    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: 'WhatsApp API error', details: data }, { status: response.status });
    }

    return Response.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});