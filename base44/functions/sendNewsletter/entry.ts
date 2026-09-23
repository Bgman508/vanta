import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newsletterId } = await req.json();

    const newsletter = await base44.entities.Newsletter.get(newsletterId);
    if (!newsletter || newsletter.senderId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (newsletter.status === 'SENT') {
      return Response.json({ error: 'Already sent' }, { status: 400 });
    }

    let recipients = [];
    if (newsletter.recipientType === 'ALL_FOLLOWERS') {
      const follows = await base44.asServiceRole.entities.Follow.filter({ followingId: user.id });
      recipients = follows.map(f => f.followerId);
    } else if (newsletter.recipientType === 'CUSTOM') {
      recipients = newsletter.recipientIds || [];
    }

    const users = await Promise.all(
      recipients.map(id => base44.asServiceRole.entities.User.get(id).catch(() => null))
    );

    for (const recipient of users.filter(Boolean)) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient.email,
        from_name: user.full_name,
        subject: newsletter.subject,
        body: newsletter.content
      });
    }

    await base44.entities.Newsletter.update(newsletterId, {
      status: 'SENT',
      sentAt: new Date().toISOString()
    });

    return Response.json({ success: true, sent: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});