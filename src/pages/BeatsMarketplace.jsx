import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Music2, Filter, Play, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function BeatsMarketplace() {
  const [user, setUser] = useState(null);
  const [genre, setGenre] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: beats } = useQuery({
    queryKey: ['beats', genre],
    queryFn: () => base44.entities.Beat.list('-created_date', 100),
    initialData: []
  });

  const filtered = beats.filter(b => 
    !b.sold &&
    (genre === 'all' || b.genre === genre) &&
    (!search || b.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <Music2 className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Beats Marketplace</h1>
        </div>

        <div className="flex gap-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beats..."
            className="flex-1 bg-neutral-900 border-neutral-800"
          />
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-40 bg-neutral-900 border-neutral-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="hip-hop">Hip Hop</SelectItem>
              <SelectItem value="trap">Trap</SelectItem>
              <SelectItem value="drill">Drill</SelectItem>
              <SelectItem value="rnb">R&B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(beat => (
            <div key={beat.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg group">
              <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                <Music2 className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-sm font-medium text-white mb-1">{beat.title}</h3>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                <span>{beat.bpm} BPM</span>
                <span>•</span>
                <span>{beat.key}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{beat.genre}</Badge>
                <Badge variant="outline" className="text-xs">{beat.license}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-light text-indigo-500">${(beat.price / 100).toFixed(2)}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}