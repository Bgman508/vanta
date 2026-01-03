import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExperienceCard from '../components/experience/ExperienceCard';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user ? base44.entities.Favorite.filter({ userId: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const experienceIds = favorites.map(f => f.experienceId);

  const { data: experiences, isLoading: loadingExperiences } = useQuery({
    queryKey: ['favorite-experiences', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const all = await base44.entities.Experience.list('-created_date', 500);
      return all.filter(exp => experienceIds.includes(exp.id));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  const isLoading = loadingFavorites || loadingExperiences;

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-4xl font-light">Favorites</h1>
          </div>
          <p className="text-neutral-400">
            {experiences.length} experience{experiences.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-neutral-900 rounded" />
                <div className="h-4 bg-neutral-900 rounded w-3/4" />
                <div className="h-3 bg-neutral-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">No favorites yet</p>
            <p className="text-sm text-neutral-600 mt-2">Heart experiences to save them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {experiences.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}