import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = Deno.env.get("TRUELAYER_CLIENT_ID");
    const clientSecret = Deno.env.get("TRUELAYER_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'TrueLayer credentials not configured' }, { status: 500 });
    }

    const { code, action } = await req.json();

    // Handle OAuth callback - exchange code for access token
    if (action === 'exchange' && code) {
      const tokenResponse = await fetch('https://auth.truelayer.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: `${new URL(req.url).origin}/api/truelayer-callback`,
          code: code
        })
      });

      const tokens = await tokenResponse.json();

      if (tokens.access_token) {
        // Save tokens to user profile
        await base44.auth.updateMe({
          truelayer_access_token: tokens.access_token,
          truelayer_refresh_token: tokens.refresh_token,
          bank_connected: true
        });

        return Response.json({ success: true });
      }

      return Response.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    // Generate auth URL
    if (action === 'init') {
      const authUrl = `https://auth.truelayer.com/?` + new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: 'info accounts balance cards transactions offline_access',
        redirect_uri: `${new URL(req.url).origin}/api/truelayer-callback`,
        providers: 'uk-oauth-all uk-ob-all'
      });

      return Response.json({ authUrl });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});