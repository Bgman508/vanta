import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GlobalSearch({ open, onOpenChange }) {
  useEffect(() => {
    const handleOpen = () => onOpenChange?.(true);
    window.addEventListener('openSearch', handleOpen);
    return () => window.removeEventListener('openSearch', handleOpen);
  }, [onOpenChange]);
  const [query, setQuery] = useState('');

  const { data: experiences } = useQuery({
    queryKey: ['search-experiences', query],
    queryFn: () => base44.entities.Experience.list('-created_date', 100),
    enabled: query.length > 0,
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['search-users', query],
    queryFn: () => base44.entities.User.list('-created_date', 50),
    enabled: query.length > 0,
    initialData: []
  });

  const filteredExperiences = experiences.filter(exp =>
    exp.title.toLowerCase().includes(query.toLowerCase()) ||
    exp.ownerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl p-0">
        <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences, artists..."
            className="border-0 bg-transparent focus-visible:ring-0 text-lg"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {query.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {filteredExperiences.length > 0 && (
              <div>
                <h3 className="text-xs uppercase text-neutral-500 mb-2">Experiences</h3>
                <div className="space-y-2">
                  {filteredExperiences.map(exp => (
                    <Link
                      key={exp.id}
                      to={createPageUrl(`ExperienceDetail?id=${exp.id}`)}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                        {exp.coverUrl ? (
                          <img src={exp.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">◆</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{exp.title}</p>
                        <p className="text-xs text-neutral-400">{exp.ownerName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div>
                <h3 className="text-xs uppercase text-neutral-500 mb-2">Artists</h3>
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <Link
                      key={user.id}
                      to={createPageUrl(`Artist?id=${user.id}`)}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="w-10 h-10 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                            {user.full_name?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.full_name}</p>
                        <p className="text-xs text-neutral-400">{user.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredExperiences.length === 0 && filteredUsers.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                No results found
              </div>
            )}
          </div>
        )}

        <div className="p-3 border-t border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
          <span>Press ESC to close</span>
          <span className="hidden md:block">⌘K to open</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}