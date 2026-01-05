import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Flame, Clock, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExperienceCard from '../components/experience/ExperienceCard';

export default function Trending() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: experiences } = useQuery({
    queryKey: ['trending-experiences'],
    queryFn: () => base44.entities.Experience.list('-attendanceCount', 100),
    initialData: []
  });

  const { data: recent } = useQuery({
    queryKey: ['recent-experiences'],
    queryFn: () => base44.entities.Experience.filter({ state: 'live' }, '-created_date', 50),
    initialData: []
  });

  const { data: favorites } = useQuery({
    queryKey: ['all-favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 500),
    initialData: []
  });

  const favoriteCounts = favorites.reduce((acc, f) => {
    acc[f.experienceId] = (acc[f.experienceId] || 0) + 1;
    return acc;
  }, {});

  const mostFavorited = experiences
    .filter(e => e.state === 'live')
    .sort((a, b) => (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0))
    .slice(0, 50);

  const trending = experiences.filter(e => e.state === 'live' && e.attendanceCount > 0).slice(0, 50);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Trending</h1>
        </div>

        <Tabs defaultValue="hot">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="hot">
              <Flame className="w-4 h-4 mr-2" />
              Hot Now
            </TabsTrigger>
            <TabsTrigger value="new">
              <Clock className="w-4 h-4 mr-2" />
              New Releases
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Most Favorited
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hot" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trending.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recent.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {mostFavorited.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}