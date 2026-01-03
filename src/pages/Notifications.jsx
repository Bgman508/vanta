import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Notifications() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: notifications, refetch } = useQuery({
    queryKey: ['all-notifications', user?.id],
    queryFn: () => user ? base44.entities.Notification.filter({ userId: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const handleMarkRead = async (id) => {
    try {
      await base44.entities.Notification.update(id, { read: true });
      refetch();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
      refetch();
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Notification.delete(id);
      refetch();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-indigo-500" />
              <h1 className="text-4xl font-light">Notifications</h1>
            </div>
            <p className="text-neutral-400">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="outline" className="border-neutral-700">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <BellOff className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notif.read
                    ? 'bg-neutral-900/30 border-neutral-800'
                    : 'bg-neutral-900/50 border-indigo-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">{notif.message}</p>
                    <p className="text-xs text-neutral-500">
                      {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!notif.read && (
                      <Button
                        onClick={() => handleMarkRead(notif.id)}
                        size="icon"
                        variant="ghost"
                        className="text-neutral-400 hover:text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(notif.id)}
                      size="icon"
                      variant="ghost"
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}