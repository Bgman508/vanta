import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, type, entityType, entityId, metadata } = await req.json();

    if (!userId || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Activity.create({
      userId,
      type,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: metadata || {},
      public: true
    });

    const followers = await base44.asServiceRole.entities.Follow.filter({ followingId: userId });
    
    for (const follower of followers.slice(0, 100)) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: follower.followerId,
        type: 'ACTIVITY',
        message: `Activity from someone you follow`,
        metadata: { activityType: type, userId }
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});