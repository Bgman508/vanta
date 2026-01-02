import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExperienceCard from '../components/experience/ExperienceCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 50),
    initialData: []
  });

  const { data: attendances } = useQuery({
    queryKey: ['attendances', user?.id],
    queryFn: () => user ? base44.entities.Attendance.filter({ userId: user.id }) : [],
    enabled: !!user,
    initialData: []
  });

  const attendedIds = new Set(attendances.map(a => a.experienceId));

  const filteredExperiences = experiences.filter(exp => {
    if (filter === 'all') return exp.state === 'live';
    if (filter === 'album') return exp.state === 'live' && exp.type === 'album';
    if (filter === 'single') return exp.state === 'live' && exp.type === 'single';
    if (filter === 'event') return exp.state === 'live' && exp.type === 'event';
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/20 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div className="relative z-10 text-center space-y-6 px-6">
          <h1 className="text-6xl md:text-8xl font-light tracking-tight">
            Experience Music
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 font-light max-w-2xl mx-auto">
            Not streams. Not playlists. Pure experiences.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light text-white">Discover</h2>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-neutral-900 border border-neutral-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="album">Albums</TabsTrigger>
              <TabsTrigger value="single">Singles</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Grid */}
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
        ) : filteredExperiences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No experiences available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredExperiences.map(exp => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                hasAccess={attendedIds.has(exp.id) || exp.ownerId === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}