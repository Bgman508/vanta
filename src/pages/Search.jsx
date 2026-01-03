import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExperienceCard from '../components/experience/ExperienceCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdvancedFilters from '../components/search/AdvancedFilters';

export default function Search() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: experiences } = useQuery({
    queryKey: ['search-all-experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 500),
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['search-all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: []
  });

  let filteredExperiences = experiences.filter(exp => {
    const matchesQuery = !query || 
      exp.title.toLowerCase().includes(query.toLowerCase()) ||
      exp.ownerName.toLowerCase().includes(query.toLowerCase()) ||
      exp.description?.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (filters) {
      const price = exp.accessRules?.[0]?.price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.states.length > 0 && !filters.states.includes(exp.state)) return false;
    }

    return true;
  });

  if (filters?.sortBy === 'popular') {
    filteredExperiences.sort((a, b) => (b.attendanceCount || 0) - (a.attendanceCount || 0));
  } else if (filters?.sortBy === 'price-low') {
    filteredExperiences.sort((a, b) => (a.accessRules?.[0]?.price || 0) - (b.accessRules?.[0]?.price || 0));
  } else if (filters?.sortBy === 'price-high') {
    filteredExperiences.sort((a, b) => (b.accessRules?.[0]?.price || 0) - (a.accessRules?.[0]?.price || 0));
  }

  const filteredUsers = users.filter(u =>
    query && (
      u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-light mb-6">Search</h1>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experiences, artists..."
                className="pl-12 h-12 bg-neutral-900 border-neutral-800 text-lg"
              />
            </div>
            <AdvancedFilters onFilterChange={setFilters} />
          </div>
        </div>

        {query.length > 0 && (
          <Tabs defaultValue="experiences">
            <TabsList className="bg-neutral-900 border border-neutral-800">
              <TabsTrigger value="experiences">
                Experiences ({filteredExperiences.length})
              </TabsTrigger>
              <TabsTrigger value="artists">
                Artists ({filteredUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experiences" className="mt-6">
              {filteredExperiences.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                  No experiences found
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredExperiences.map(exp => (
                    <ExperienceCard key={exp.id} experience={exp} hasAccess={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="artists" className="mt-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                  No artists found
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(artist => (
                    <Link
                      key={artist.id}
                      to={createPageUrl(`Artist?id=${artist.id}`)}
                      className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0">
                          {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xl">
                              {artist.full_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{artist.full_name}</p>
                          <p className="text-sm text-neutral-400">{artist.role}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!query && (
          <div className="text-center py-20 text-neutral-500">
            Start typing to search for experiences and artists
          </div>
        )}
      </div>
    </div>
  );
}