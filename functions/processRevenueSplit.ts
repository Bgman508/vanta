import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { experienceId, amount } = await req.json();

    const experience = await base44.asServiceRole.entities.Experience.get(experienceId);
    if (!experience) {
      return Response.json({ error: 'Experience not found' }, { status: 404 });
    }

    const rules = experience.revenueRules || {
      artist: 70,
      label: 15,
      publisher: 10,
      producer: 5,
      platform: 0
    };

    const splits = {
      artist: Math.floor(amount * (rules.artist / 100)),
      label: Math.floor(amount * (rules.label / 100)),
      publisher: Math.floor(amount * (rules.publisher / 100)),
      producer: Math.floor(amount * (rules.producer / 100)),
      platform: Math.floor(amount * (rules.platform / 100))
    };

    await base44.asServiceRole.entities.Experience.update(experienceId, {
      totalRevenue: (experience.totalRevenue || 0) + amount
    });

    return Response.json({ success: true, splits });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});