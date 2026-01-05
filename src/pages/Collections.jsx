import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FolderHeart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function Collections() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: collections } = useQuery({
    queryKey: ['public-collections'],
    queryFn: () => base44.entities.Collection.filter({ public: true }, '-created_date'),
    initialData: []
  });

  const { data: featured } = useQuery({
    queryKey: ['featured-collections'],
    queryFn: () => base44.entities.Collection.filter({ featured: true }, '-created_date'),
    initialData: []
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderHeart className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-light">Collections</h1>
          </div>
          {user && ['LABEL', 'PUBLISHER', 'ADMIN'].includes(user.role) && (
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          )}
        </div>

        {featured.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-white">Featured</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(collection => (
                <Link
                  key={collection.id}
                  to={createPageUrl(`Collection?id=${collection.id}`)}
                  className="group"
                >
                  <div className="aspect-video bg-neutral-900 rounded-lg overflow-hidden mb-3">
                    {collection.coverUrl ? (
                      <img src={collection.coverUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderHeart className="w-12 h-12 text-neutral-700" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{collection.experienceIds?.length || 0} experiences</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-light text-white">All Collections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <Link
                key={collection.id}
                to={createPageUrl(`Collection?id=${collection.id}`)}
                className="group"
              >
                <div className="aspect-video bg-neutral-900 rounded-lg overflow-hidden mb-3">
                  {collection.coverUrl ? (
                    <img src={collection.coverUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderHeart className="w-12 h-12 text-neutral-700" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                  {collection.title}
                </h3>
                <p className="text-sm text-neutral-500">{collection.experienceIds?.length || 0} experiences</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}