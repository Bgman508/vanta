import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FavoriteButton({ experienceId, user, size = 'default' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && experienceId) {
      base44.entities.Favorite.filter({ userId: user.id, experienceId }).then(list => {
        if (list.length > 0) {
          setIsFavorite(true);
          setFavoriteId(list[0].id);
        }
      });
    }
  }, [user, experienceId]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Sign in to favorite');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await base44.entities.Favorite.delete(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Removed from favorites');
      } else {
        const fav = await base44.entities.Favorite.create({
          userId: user.id,
          experienceId
        });
        setIsFavorite(true);
        setFavoriteId(fav.id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleFavorite}
      disabled={loading}
      size={size === 'icon' ? 'icon' : 'sm'}
      variant={isFavorite ? 'default' : 'outline'}
      className={isFavorite ? 'bg-red-600 hover:bg-red-700' : 'border-neutral-700'}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      {size !== 'icon' && <span className="ml-2">{isFavorite ? 'Favorited' : 'Favorite'}</span>}
    </Button>
  );
}