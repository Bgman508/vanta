import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function DistributionHub({ experience, user }) {
  const [selected, setSelected] = useState([]);

  const platforms = [
    { id: 'spotify', name: 'Spotify', icon: '🎵' },
    { id: 'apple', name: 'Apple Music', icon: '🍎' },
    { id: 'youtube', name: 'YouTube Music', icon: '📺' },
    { id: 'amazon', name: 'Amazon Music', icon: '📦' },
    { id: 'tidal', name: 'Tidal', icon: '🌊' }
  ];

  const { data: distributions } = useQuery({
    queryKey: ['distributions', experience.id],
    queryFn: () => base44.entities.Distribution.filter({ experienceId: experience.id }),
    initialData: []
  });

  const handleDistribute = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    try {
      await base44.entities.Distribution.create({
        experienceId: experience.id,
        userId: user.id,
        platforms: selected,
        releaseDate: new Date().toISOString()
      });
      toast.success('Distribution started');
    } catch (error) {
      toast.error('Failed to start distribution');
    }
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Distribution Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {platforms.map(platform => (
            <label key={platform.id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-800">
              <Checkbox
                checked={selected.includes(platform.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelected([...selected, platform.id]);
                  } else {
                    setSelected(selected.filter(p => p !== platform.id));
                  }
                }}
              />
              <span className="text-2xl">{platform.icon}</span>
              <span className="text-sm text-white">{platform.name}</span>
            </label>
          ))}
        </div>

        <Button onClick={handleDistribute} className="w-full bg-indigo-600 hover:bg-indigo-700">
          Distribute to Selected Platforms
        </Button>

        {distributions.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <h4 className="text-sm font-medium text-white">Active Distributions</h4>
            {distributions.map(dist => (
              <div key={dist.id} className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
                <span className="text-xs text-neutral-400">{dist.platforms.join(', ')}</span>
                <div className="flex items-center gap-1">
                  {dist.status === 'LIVE' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  {dist.status === 'PROCESSING' && <Clock className="w-3 h-3 text-amber-500" />}
                  {dist.status === 'FAILED' && <XCircle className="w-3 h-3 text-red-500" />}
                  <span className="text-xs text-neutral-500">{dist.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}