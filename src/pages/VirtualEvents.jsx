import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Video, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function VirtualEvents() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: events, isLoading } = useQuery({
    queryKey: ['virtual-events'],
    queryFn: () => base44.entities.VirtualEvent.list('-scheduledAt', 50),
    initialData: []
  });

  const handleJoin = async (event) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    if (event.capacity && event.attendees?.length >= event.capacity) {
      toast.error('Event is full');
      return;
    }

    const attendees = [...(event.attendees || []), user.id];
    await base44.entities.VirtualEvent.update(event.id, { attendees });
    toast.success('Joined event!');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <Video className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Virtual Events</h1>
        </div>

        {isLoading ? (
          <div className="text-neutral-500">Loading events...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{event.type}</Badge>
                  <Badge className={
                    event.status === 'LIVE' ? 'bg-red-500' :
                    event.status === 'UPCOMING' ? 'bg-indigo-500' : 'bg-neutral-600'
                  }>
                    {event.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-neutral-400 line-clamp-2">{event.description}</p>
                </div>

                <div className="space-y-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(event.scheduledAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{event.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees?.length || 0} / {event.capacity || '∞'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <span className="text-lg font-light text-indigo-500">
                    {event.price ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleJoin(event)}
                    disabled={event.status === 'ENDED'}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {event.status === 'LIVE' ? 'Join Now' : 'Register'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}