import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import ExperienceCard from '../experience/ExperienceCard';

export default function AIRecommendations({ user }) {
  const { data: recommendations } = useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get user's play history
      const history = await base44.entities.PlayHistory.filter({ userId: user.id }, '-lastAccessedAt', 50);
      const favorites = await base44.entities.Favorite.filter({ userId: user.id });
      
      // Get all experiences
      const allExperiences = await base44.entities.Experience.filter({ state: 'live' });
      
      // Simple recommendation logic (in production, use ML)
      const historyIds = new Set(history.map(h => h.experienceId));
      const favIds = new Set(favorites.map(f => f.experienceId));
      
      return allExperiences
        .filter(e => !historyIds.has(e.id) && !favIds.has(e.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    },
    enabled: !!user,
    initialData: []
  });

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-medium text-white">Recommended For You</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.map(exp => (
          <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
        ))}
      </div>
    </div>
  );
}