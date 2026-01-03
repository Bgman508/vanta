import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ExperienceCard from '../experience/ExperienceCard';
import { Sparkles } from 'lucide-react';

export default function Recommendations({ user, currentExperience }) {
  const { data: userAttendances } = useQuery({
    queryKey: ['user-attendances', user?.id],
    queryFn: () => user ? base44.entities.Attendance.filter({ userId: user.id }) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: allExperiences } = useQuery({
    queryKey: ['all-experiences-rec'],
    queryFn: () => base44.entities.Experience.list('-created_date', 100),
    initialData: []
  });

  const attendedIds = new Set(userAttendances.map(a => a.experienceId));
  const attendedExps = allExperiences.filter(e => attendedIds.has(e.id));

  const artistIds = new Set(attendedExps.map(e => e.ownerId));
  const types = attendedExps.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const mostLikedType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0];

  let recommendations = allExperiences.filter(exp => {
    if (attendedIds.has(exp.id)) return false;
    if (currentExperience && exp.id === currentExperience.id) return false;
    if (exp.state !== 'live') return false;
    
    const sameArtist = artistIds.has(exp.ownerId);
    const sameType = exp.type === mostLikedType;
    
    return sameArtist || sameType;
  });

  if (recommendations.length === 0) {
    recommendations = allExperiences.filter(e => 
      e.state === 'live' && 
      !attendedIds.has(e.id) && 
      (!currentExperience || e.id !== currentExperience.id)
    );
  }

  recommendations = recommendations.slice(0, 5);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-medium text-white">Recommended For You</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.map(exp => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            hasAccess={false}
          />
        ))}
      </div>
    </div>
  );
}