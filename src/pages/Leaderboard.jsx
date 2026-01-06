import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Heart, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Leaderboard() {
  const { data: experiences } = useQuery({
    queryKey: ['leaderboard-experiences'],
    queryFn: () => base44.entities.Experience.list('-totalRevenue', 100),
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['leaderboard-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: []
  });

  const { data: favorites } = useQuery({
    queryKey: ['leaderboard-favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 1000),
    initialData: []
  });

  const topByRevenue = experiences.filter(e => e.totalRevenue > 0).slice(0, 50);
  const topByUnlocks = [...experiences].sort((a, b) => (b.attendanceCount || 0) - (a.attendanceCount || 0)).slice(0, 50);

  const favoriteCounts = favorites.reduce((acc, f) => {
    acc[f.experienceId] = (acc[f.experienceId] || 0) + 1;
    return acc;
  }, {});

  const topByFavorites = [...experiences]
    .sort((a, b) => (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0))
    .slice(0, 50);

  const topArtists = users
    .filter(u => ['ARTIST', 'LABEL'].includes(u.role))
    .slice(0, 50);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h1 className="text-4xl font-light">Leaderboard</h1>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="revenue">
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Earners
            </TabsTrigger>
            <TabsTrigger value="unlocks">
              <Users className="w-4 h-4 mr-2" />
              Most Unlocked
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Most Favorited
            </TabsTrigger>
            <TabsTrigger value="artists">
              <Trophy className="w-4 h-4 mr-2" />
              Top Artists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-6">
            <div className="space-y-2">
              {topByRevenue.map((exp, idx) => (
                <Link key={exp.id} to={createPageUrl(`ExperienceDetail?id=${exp.id}`)} className="block p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-light text-neutral-500 w-8">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{exp.title}</p>
                      <p className="text-xs text-neutral-500">{exp.ownerName}</p>
                    </div>
                    <span className="text-lg font-light text-emerald-500">${(exp.totalRevenue / 100).toFixed(0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unlocks" className="mt-6">
            <div className="space-y-2">
              {topByUnlocks.map((exp, idx) => (
                <Link key={exp.id} to={createPageUrl(`ExperienceDetail?id=${exp.id}`)} className="block p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-light text-neutral-500 w-8">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{exp.title}</p>
                      <p className="text-xs text-neutral-500">{exp.ownerName}</p>
                    </div>
                    <span className="text-lg font-light text-indigo-500">{exp.attendanceCount || 0} unlocks</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="space-y-2">
              {topByFavorites.map((exp, idx) => (
                <Link key={exp.id} to={createPageUrl(`ExperienceDetail?id=${exp.id}`)} className="block p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-light text-neutral-500 w-8">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{exp.title}</p>
                      <p className="text-xs text-neutral-500">{exp.ownerName}</p>
                    </div>
                    <span className="text-lg font-light text-pink-500">{favoriteCounts[exp.id] || 0} favorites</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="mt-6">
            <div className="space-y-2">
              {topArtists.map((artist, idx) => (
                <Link key={artist.id} to={createPageUrl(`Artist?id=${artist.id}`)} className="block p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-light text-neutral-500 w-8">#{idx + 1}</span>
                    <div className="w-12 h-12 bg-neutral-800 rounded-full overflow-hidden">
                      {artist.avatar_url ? (
                        <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          {artist.full_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{artist.full_name}</p>
                      <p className="text-xs text-neutral-500">{artist.role}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}