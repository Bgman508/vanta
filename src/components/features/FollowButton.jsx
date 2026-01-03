import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FollowButton({ artistId, user, size = 'default' }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && artistId && user.id !== artistId) {
      base44.entities.Follow.filter({ followerId: user.id, followingId: artistId }).then(list => {
        if (list.length > 0) {
          setIsFollowing(true);
          setFollowId(list[0].id);
        }
      });
    }
  }, [user, artistId]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Sign in to follow');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await base44.entities.Follow.delete(followId);
        setIsFollowing(false);
        setFollowId(null);
        toast.success('Unfollowed');
      } else {
        const follow = await base44.entities.Follow.create({
          followerId: user.id,
          followingId: artistId,
          notifications: true
        });
        setIsFollowing(true);
        setFollowId(follow.id);
        toast.success('Now following');
      }
    } catch (error) {
      toast.error('Failed to update follow');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === artistId) return null;

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      size={size}
      variant={isFollowing ? 'outline' : 'default'}
      className={isFollowing ? 'border-neutral-700' : 'bg-indigo-600 hover:bg-indigo-700'}
    >
      {isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}