import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { distributionId } = await req.json();

    const distribution = await base44.entities.Distribution.get(distributionId);
    if (!distribution || distribution.userId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    await base44.entities.Distribution.update(distributionId, {
      status: 'PROCESSING'
    });

    // Simulate distribution processing
    setTimeout(async () => {
      try {
        await base44.asServiceRole.entities.Distribution.update(distributionId, {
          status: 'LIVE',
          isrc: `VANTA${Date.now()}`,
          upc: `${Date.now()}`
        });

        await base44.asServiceRole.functions.invoke('sendNotification', {
          userId: user.id,
          type: 'DISTRIBUTION',
          title: 'Distribution Complete',
          message: `Your music is now live on ${distribution.platforms.join(', ')}`
        });
      } catch (e) {
        await base44.asServiceRole.entities.Distribution.update(distributionId, {
          status: 'FAILED',
          errors: [e.message]
        });
      }
    }, 5000);

    return Response.json({ success: true, message: 'Distribution processing started' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});