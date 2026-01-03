import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon, Heart, UserPlus, Music, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const activityIcons = {
  UNLOCK: Music,
  FAVORITE: Heart,
  FOLLOW: UserPlus,
  GIFT_SENT: Gift,
  EXPERIENCE_PUBLISHED: Music
};

export default function ActivityFeed() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: following } = useQuery({
    queryKey: ['my-following', user?.id],
    queryFn: () => user ? base44.entities.Follow.filter({ followerId: user.id }) : [],
    enabled: !!user,
    initialData: []
  });

  const followingIds = following.map(f => f.followingId);

  const { data: activities } = useQuery({
    queryKey: ['feed-activities', followingIds.join(',')],
    queryFn: async () => {
      if (followingIds.length === 0) return [];
      const all = await base44.entities.Activity.list('-created_date', 100);
      return all.filter(a => followingIds.includes(a.userId));
    },
    enabled: followingIds.length > 0,
    initialData: []
  });

  const { data: experiences } = useQuery({
    queryKey: ['feed-experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 200),
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['feed-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    initialData: []
  });

  if (!user) return null;

  const getUser = (id) => users.find(u => u.id === id);
  const getExperience = (id) => experiences.find(e => e.id === id);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <ActivityIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Activity Feed</h1>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-20">
            <UserPlus className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 mb-2">Your feed is empty</p>
            <p className="text-sm text-neutral-600">Follow artists to see their activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => {
              const activityUser = getUser(activity.userId);
              const experience = activity.experienceId ? getExperience(activity.experienceId) : null;
              const Icon = activityIcons[activity.type] || Music;

              return (
                <div key={activity.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-500" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-neutral-300">
                        <Link to={createPageUrl(`Artist?id=${activity.userId}`)} className="text-white font-medium hover:text-indigo-400">
                          {activityUser?.full_name}
                        </Link>
                        {activity.type === 'UNLOCK' && ' unlocked '}
                        {activity.type === 'FAVORITE' && ' favorited '}
                        {activity.type === 'FOLLOW' && ' followed someone'}
                        {activity.type === 'EXPERIENCE_PUBLISHED' && ' published '}
                        {experience && (
                          <Link to={createPageUrl(`ExperienceDetail?id=${experience.id}`)} className="text-indigo-400 hover:text-indigo-300">
                            {experience.title}
                          </Link>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>

                    {experience?.coverUrl && (
                      <Link to={createPageUrl(`ExperienceDetail?id=${experience.id}`)} className="w-12 h-12 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                        <img src={experience.coverUrl} alt="" className="w-full h-full object-cover" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}