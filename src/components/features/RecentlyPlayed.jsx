import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ExperienceCard from '../experience/ExperienceCard';
import { Clock } from 'lucide-react';

export default function RecentlyPlayed({ user }) {
  const { data: playHistory } = useQuery({
    queryKey: ['play-history', user?.id],
    queryFn: () => user ? base44.entities.PlayHistory.filter({ userId: user.id }, '-lastAccessedAt', 10) : [],
    enabled: !!user,
    initialData: []
  });

  const experienceIds = playHistory.map(p => p.experienceId);

  const { data: experiences } = useQuery({
    queryKey: ['recent-experiences', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const all = await base44.entities.Experience.list('-created_date', 500);
      return all.filter(exp => experienceIds.includes(exp.id));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  const sortedExperiences = experiences.sort((a, b) => {
    const aHistory = playHistory.find(p => p.experienceId === a.id);
    const bHistory = playHistory.find(p => p.experienceId === b.id);
    return new Date(bHistory.lastAccessedAt) - new Date(aHistory.lastAccessedAt);
  });

  if (sortedExperiences.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-medium text-white">Recently Played</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedExperiences.slice(0, 5).map(exp => (
          <ExperienceCard key={exp.id} experience={exp} hasAccess={true} />
        ))}
      </div>
    </div>
  );
}