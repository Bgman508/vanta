import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExperienceCard from '../components/experience/ExperienceCard';
import { Library } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: attendances, isLoading: loadingAttendances } = useQuery({
    queryKey: ['attendances', user?.id],
    queryFn: () => user ? base44.entities.Attendance.filter({ userId: user.id }, '-attendedAt') : [],
    enabled: !!user,
    initialData: []
  });

  const experienceIds = [...new Set(attendances.map(a => a.experienceId))];

  const { data: experiences, isLoading: loadingExperiences } = useQuery({
    queryKey: ['attended-experiences', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const allExperiences = await base44.entities.Experience.list('-created_date', 1000);
      return allExperiences.filter(exp => experienceIds.includes(exp.id));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  const isLoading = loadingAttendances || loadingExperiences;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Library className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-4xl font-light mb-1">Your Collection</h1>
            <p className="text-neutral-400">
              {experiences.length} experience{experiences.length !== 1 ? 's' : ''} unlocked
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-neutral-900 rounded" />
                <div className="h-4 bg-neutral-900 rounded w-3/4" />
                <div className="h-3 bg-neutral-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No experiences in your collection yet</p>
            <p className="text-sm text-neutral-600 mt-2">
              Discover and unlock experiences to build your collection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {experiences.map(exp => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                hasAccess={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}