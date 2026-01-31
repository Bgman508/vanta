import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StudioBookings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => user ? base44.entities.StudioBooking.filter({ userId: user.id }) : [],
    enabled: !!user,
    initialData: []
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.StudioBooking.update(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled');
    }
  });

  const statusColors = {
    PENDING: 'bg-amber-500',
    CONFIRMED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
    COMPLETED: 'bg-neutral-500'
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign in to view bookings</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-4xl font-light">Studio Bookings</h1>

        {isLoading ? (
          <div className="text-neutral-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Studio Session</h3>
                    <div className="space-y-1 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(booking.startTime), 'h:mm a')} - 
                          {format(new Date(booking.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>

                {booking.notes && (
                  <p className="text-sm text-neutral-400 mb-4">{booking.notes}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <span className="text-lg font-light text-indigo-500">
                    ${(booking.price / 100).toFixed(2)}
                  </span>
                  {booking.status === 'CONFIRMED' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => cancelMutation.mutate(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}