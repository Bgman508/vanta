import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await base44.entities.PlayHistory.filter({ userId: user.id }, '-lastAccessedAt', 50);
    const favorites = await base44.entities.Favorite.filter({ userId: user.id });
    const allExperiences = await base44.asServiceRole.entities.Experience.filter({ state: 'live' }, '-created_date', 100);

    const historyIds = new Set(history.map(h => h.experienceId));
    const favIds = new Set(favorites.map(f => f.experienceId));

    const userExperiences = [...history, ...favorites].map(item => {
      const exp = allExperiences.find(e => e.id === (item.experienceId || item.id));
      return exp ? `${exp.title} by ${exp.ownerName} (${exp.type})` : null;
    }).filter(Boolean).slice(0, 10);

    const aiRecommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on this user's music taste: ${userExperiences.join(', ')}. Recommend 10 similar experiences from this catalog (return only IDs): ${allExperiences.map(e => `${e.id}:${e.title} by ${e.ownerName}`).join(', ')}. Consider genre similarity, artist style, and type. Return JSON array of experience IDs.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendedIds: { type: "array", items: { type: "string" } }
        }
      }
    });

    const recommended = allExperiences
      .filter(e => !historyIds.has(e.id) && !favIds.has(e.id))
      .filter(e => aiRecommendations.recommendedIds?.includes(e.id))
      .slice(0, 10);

    for (const exp of recommended) {
      await base44.asServiceRole.entities.Recommendation.create({
        userId: user.id,
        experienceId: exp.id,
        score: 0.8,
        reason: 'SIMILAR_GENRE'
      });
    }

    return Response.json({ success: true, count: recommended.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});