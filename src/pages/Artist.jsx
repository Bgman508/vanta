import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Music, MapPin, Globe, CheckCircle } from 'lucide-react';
import ExperienceCard from '../components/experience/ExperienceCard';
import FollowButton from '../components/features/FollowButton';

export default function Artist() {
  const [currentUser, setCurrentUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: artist, isLoading: loadingArtist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: artistId });
      return users[0];
    },
    enabled: !!artistId
  });

  const { data: experiences } = useQuery({
    queryKey: ['artist-experiences', artistId],
    queryFn: () => base44.entities.Experience.filter({ ownerId: artistId }, '-created_date'),
    enabled: !!artistId,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['artist-followers', artistId],
    queryFn: () => base44.entities.Follow.filter({ followingId: artistId }),
    enabled: !!artistId,
    initialData: []
  });

  if (loadingArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Artist not found</div>
      </div>
    );
  }

  const liveExperiences = experiences.filter(e => e.state === 'live');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-80 bg-gradient-to-b from-neutral-800 to-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Profile */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-12">
          <div className="w-40 h-40 bg-neutral-900 rounded-full overflow-hidden border-4 border-[#0a0a0a] flex-shrink-0">
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600 text-5xl">
                {artist.full_name?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-light text-white">{artist.full_name}</h1>
              {artist.verified && (
                <CheckCircle className="w-6 h-6 text-indigo-500 fill-current" />
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{followers.length} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span>{liveExperiences.length} experiences</span>
              </div>
              {artist.territory && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.territory}</span>
                </div>
              )}
            </div>

            {artist.bio && (
              <p className="text-neutral-300 mb-4 max-w-2xl">{artist.bio}</p>
            )}

            <div className="flex items-center gap-3">
              <FollowButton artistId={artistId} user={currentUser} size="default" />
              
              {artist.socialLinks?.website && (
                <a
                  href={artist.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Experiences */}
        <div className="space-y-6 pb-20">
          <h2 className="text-2xl font-light text-white">Experiences</h2>

          {liveExperiences.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              No experiences published yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {liveExperiences.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}