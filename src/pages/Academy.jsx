import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Play, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Academy() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: masterclasses } = useQuery({
    queryKey: ['masterclasses'],
    queryFn: () => base44.entities.Masterclass.list('-created_date', 50),
    initialData: []
  });

  const categories = ['PRODUCTION', 'MIXING', 'MARKETING', 'BUSINESS', 'PERFORMANCE'];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">VANTA Academy</h1>
        </div>

        <p className="text-neutral-400 max-w-2xl">
          Learn from industry professionals. Master your craft with exclusive courses and workshops.
        </p>

        <Tabs defaultValue="all">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {masterclasses.map(course => (
                <div key={course.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden group">
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <Badge variant="outline">{course.category}</Badge>
                    <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span>{course.rating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <span className="text-lg font-light text-indigo-500">${(course.price / 100).toFixed(2)}</span>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Enroll
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {masterclasses.filter(c => c.category === cat).map(course => (
                  <div key={course.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden group">
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <Badge variant="outline">{course.category}</Badge>
                      <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-neutral-400 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span>{course.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                        <span className="text-lg font-light text-indigo-500">${(course.price / 100).toFixed(2)}</span>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}