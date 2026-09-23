import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, type, title, message, metadata } = await req.json();

    if (!userId || !type || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Notification.create({
      userId,
      type,
      title: title || type,
      message,
      metadata: metadata || {},
      read: false
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});