import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const experiences = await base44.asServiceRole.entities.Experience.list('-created_date', 1000);
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const receipts = await base44.asServiceRole.entities.Receipt.list('-created_date', 1000);

    const totalRevenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const activeExperiences = experiences.filter(e => e.state === 'live').length;
    const totalUsers = users.length;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentUsers = users.filter(u => new Date(u.created_date) > last30Days).length;
    const recentRevenue = receipts
      .filter(r => new Date(r.created_date) > last30Days)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return Response.json({
      totalRevenue,
      totalUsers,
      activeExperiences,
      recentUsers,
      recentRevenue,
      avgRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});