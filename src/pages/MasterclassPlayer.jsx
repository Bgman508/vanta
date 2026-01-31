import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Play, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function MasterclassPlayer() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['masterclass', courseId],
    queryFn: () => base44.entities.Masterclass.get(courseId),
    enabled: !!courseId
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="aspect-video bg-black rounded-lg mb-6">
          <video controls className="w-full h-full" src={course.videoUrl} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-light text-white mb-2">{course.title}</h1>
            <p className="text-neutral-400">{course.description}</p>
          </div>

          <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Your Progress</span>
              <span className="text-sm text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {course.materials?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Course Materials</h3>
              {course.materials.map((material, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <span className="text-sm text-white">Material {i + 1}</span>
                  <Button size="sm" variant="outline" className="border-neutral-800">
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}