import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ExperiencePlayer({ media, experienceId, user }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!user || !experienceId) return;

    const trackPlay = async () => {
      const existing = await base44.entities.PlayHistory.filter({
        userId: user.id,
        experienceId
      });

      if (existing.length > 0) {
        await base44.entities.PlayHistory.update(existing[0].id, {
          lastAccessedAt: new Date().toISOString(),
          accessCount: (existing[0].accessCount || 0) + 1
        });
      } else {
        await base44.entities.PlayHistory.create({
          userId: user.id,
          experienceId,
          lastAccessedAt: new Date().toISOString(),
          accessCount: 1
        });
      }
    };

    trackPlay();
  }, [user, experienceId]);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-video bg-neutral-900 rounded-xl flex items-center justify-center">
        <p className="text-sm text-neutral-500">No media available</p>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {currentMedia.type === 'audio' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black">
            <div className="text-center space-y-4">
              <div className="text-8xl text-neutral-700">◆</div>
              <p className="text-lg text-white font-light">{currentMedia.title}</p>
            </div>
          </div>
        ) : (
          <video
            src={currentMedia.url}
            className="w-full h-full object-cover"
            controls={false}
          />
        )}

        {/* Controls overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            {/* Progress bar */}
            <div className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-white w-0" />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:text-indigo-400"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <div className="text-sm text-white">
                  0:00 / {Math.floor(currentMedia.duration / 60)}:{String(currentMedia.duration % 60).padStart(2, '0')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-white">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-white">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      {media.length > 1 && (
        <div className="space-y-1">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                index === currentIndex
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}