import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User as UserIcon, Music, Heart, Users, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExperienceCard from '../components/experience/ExperienceCard';
import { format } from 'date-fns';

export default function Profile() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: profileId });
      return users[0];
    },
    enabled: !!profileId
  });

  const { data: favorites } = useQuery({
    queryKey: ['user-favorites', profileId],
    queryFn: () => base44.entities.Favorite.filter({ userId: profileId }),
    enabled: !!profileId,
    initialData: []
  });

  const { data: following } = useQuery({
    queryKey: ['user-following', profileId],
    queryFn: () => base44.entities.Follow.filter({ followerId: profileId }),
    enabled: !!profileId,
    initialData: []
  });

  const { data: activities } = useQuery({
    queryKey: ['user-activities', profileId],
    queryFn: () => base44.entities.Activity.filter({ userId: profileId, visibility: 'PUBLIC' }, '-created_date', 50),
    enabled: !!profileId,
    initialData: []
  });

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profileId;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-neutral-900 rounded-full overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-neutral-600">
                {profile.full_name?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-light mb-2">{profile.full_name}</h1>
            <p className="text-neutral-400 mb-4">{profile.bio}</p>

            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{favorites.length} favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{following.length} following</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(profile.created_date), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-300">{activity.type}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <p className="text-neutral-500 text-center py-12">
              {isOwnProfile ? 'Your favorites are private' : 'This user\'s favorites are private'}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}