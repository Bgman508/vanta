import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { beatId } = await req.json();

    const beat = await base44.entities.Beat.get(beatId);
    if (!beat || beat.sold) {
      return Response.json({ error: 'Beat not available' }, { status: 404 });
    }

    await base44.entities.Receipt.create({
      userId: user.id,
      entityType: 'Beat',
      entityId: beatId,
      amount: beat.price,
      status: 'COMPLETED'
    });

    await base44.entities.Beat.update(beatId, {
      sold: true,
      downloads: (beat.downloads || 0) + 1
    });

    await base44.functions.invoke('sendNotification', {
      userId: beat.producerId,
      type: 'SALE',
      title: 'Beat Sold',
      message: `${user.full_name} purchased your beat "${beat.title}"`
    });

    return Response.json({ success: true, beat });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});