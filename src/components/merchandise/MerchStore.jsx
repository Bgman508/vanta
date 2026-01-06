import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MerchStore({ artistId }) {
  const { data: merch } = useQuery({
    queryKey: ['merch', artistId],
    queryFn: () => base44.entities.Merchandise.filter({ sellerId: artistId }),
    initialData: []
  });

  if (merch.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-medium text-white">Merchandise</h3>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {merch.map(item => (
          <Card key={item.id} className="bg-neutral-900/50 border-neutral-800 overflow-hidden group">
            <div className="aspect-square bg-neutral-800">
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-white mb-1">{item.name}</p>
              <p className="text-lg font-light text-indigo-500">${(item.price / 100).toFixed(2)}</p>
              <Button size="sm" className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}