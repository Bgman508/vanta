import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExperienceForm from '../components/studio/ExperienceForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Studio() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('list'); // list, create, edit
  const [selectedExperience, setSelectedExperience] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!['ARTIST', 'LABEL', 'ADMIN'].includes(user.role)) {
        toast.error('You need to be an artist or label to access the studio');
        window.location.href = '/';
        return;
      }
      setUser(user);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: experiences, isLoading, refetch } = useQuery({
    queryKey: ['my-experiences', user?.id],
    queryFn: () => user ? base44.entities.Experience.filter({ ownerId: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const handleDelete = async (experience) => {
    if (!confirm(`Delete "${experience.title}"?`)) return;

    try {
      await base44.entities.Experience.delete(experience.id);
      toast.success('Experience deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete');
      console.error(error);
    }
  };

  const handleSaved = () => {
    setMode('list');
    setSelectedExperience(null);
    refetch();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light mb-2">Studio</h1>
            <p className="text-neutral-400">Create and manage your experiences</p>
          </div>

          {mode === 'list' && (
            <Button
              onClick={() => setMode('create')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Experience
            </Button>
          )}

          {mode !== 'list' && (
            <Button
              onClick={() => {
                setMode('list');
                setSelectedExperience(null);
              }}
              variant="outline"
              className="border-neutral-800"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Content */}
        {mode === 'list' ? (
          <div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-neutral-500 mb-6">No experiences yet</p>
                <Button
                  onClick={() => setMode('create')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Your First Experience
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map(exp => (
                  <div
                    key={exp.id}
                    className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-20 h-20 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                          {exp.coverUrl ? (
                            <img src={exp.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                              ◆
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-white truncate">{exp.title}</h3>
                            <span className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-400 uppercase">
                              {exp.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                              exp.state === 'live' ? 'bg-emerald-500/20 text-emerald-500' :
                              exp.state === 'draft' ? 'bg-neutral-800 text-neutral-400' :
                              'bg-amber-500/20 text-amber-500'
                            }`}>
                              {exp.state}
                            </span>
                          </div>

                          <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                            {exp.description || 'No description'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span>{exp.attendanceCount || 0} unlocked</span>
                            <span>${((exp.totalRevenue || 0) / 100).toFixed(2)} revenue</span>
                            <span>{format(new Date(exp.created_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedExperience(exp);
                            setMode('edit');
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-neutral-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(exp)}
                          variant="ghost"
                          size="icon"
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
        ) : (
          <div className="max-w-3xl">
            <ExperienceForm
              user={user}
              experience={selectedExperience}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>
    </div>
  );
}