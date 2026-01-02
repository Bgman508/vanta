import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExperienceCard from '../components/experience/ExperienceCard';
import { Lock, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Vault() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: attendances, isLoading: loadingAttendances } = useQuery({
    queryKey: ['vault-attendances', user?.id],
    queryFn: () => user ? base44.entities.Attendance.filter({ userId: user.id }, '-attendedAt') : [],
    enabled: !!user,
    initialData: []
  });

  const experienceIds = [...new Set(attendances.map(a => a.experienceId))];

  const { data: experiences, isLoading: loadingExperiences } = useQuery({
    queryKey: ['vault-experiences', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const allExperiences = await base44.entities.Experience.list('-created_date', 1000);
      return allExperiences.filter(exp => experienceIds.includes(exp.id));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  const isLoading = loadingAttendances || loadingExperiences;

  // Filter and sort
  let filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || exp.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (sortBy === 'recent') {
    const attendanceMap = new Map(attendances.map(a => [a.experienceId, new Date(a.attendedAt || a.created_date)]));
    filteredExperiences.sort((a, b) => {
      const dateA = attendanceMap.get(a.id) || new Date(0);
      const dateB = attendanceMap.get(b.id) || new Date(0);
      return dateB - dateA;
    });
  } else if (sortBy === 'title') {
    filteredExperiences.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'artist') {
    filteredExperiences.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
  }

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
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-light">Your Vault</h1>
          </div>
          <p className="text-neutral-400">
            {experiences.length} experience{experiences.length !== 1 ? 's' : ''} unlocked
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your collection..."
              className="pl-10 bg-neutral-900 border-neutral-800"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-neutral-900 border-neutral-800">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="album">Albums</SelectItem>
              <SelectItem value="single">Singles</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="session">Sessions</SelectItem>
              <SelectItem value="archive">Archives</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-neutral-900 border-neutral-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="artist">Artist A-Z</SelectItem>
            </SelectContent>
          </Select>
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
            <Lock className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">
              {searchQuery || typeFilter !== 'all' 
                ? 'No experiences match your filters' 
                : 'No experiences in your vault yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredExperiences.map(exp => (
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