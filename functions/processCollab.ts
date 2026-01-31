import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collabId, action } = await req.json();

    const collab = await base44.entities.Collab.get(collabId);
    if (!collab || collab.collaboratorId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (action === 'accept') {
      await base44.entities.Collab.update(collabId, { status: 'ACCEPTED' });

      const experience = await base44.asServiceRole.entities.Experience.get(collab.experienceId);
      const contributors = experience.contributors || [];
      
      contributors.push({
        name: user.full_name,
        role: collab.role,
        userId: user.id
      });

      await base44.asServiceRole.entities.Experience.update(collab.experienceId, { contributors });

      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: collab.initiatorId,
        type: 'COLLAB',
        title: 'Collaboration Accepted',
        message: `${user.full_name} accepted your collaboration request`
      });
    } else {
      await base44.entities.Collab.update(collabId, { status: 'DECLINED' });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});