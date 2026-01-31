import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export default function AdvancedPlayer({ queue, onNext, onPrev, currentTrack }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState('OFF');
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (currentTrack?.url && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (playing) audioRef.current.play();
    }
  }, [currentTrack]);

  useEffect(() => {
    const handleToggle = () => setPlaying(!playing);
    const handleNext = () => onNext?.();
    const handlePrev = () => onPrev?.();
    
    window.addEventListener('playerToggle', handleToggle);
    window.addEventListener('playerNext', handleNext);
    window.addEventListener('playerPrev', handlePrev);
    
    return () => {
      window.removeEventListener('playerToggle', handleToggle);
      window.removeEventListener('playerNext', handleNext);
      window.removeEventListener('playerPrev', handlePrev);
    };
  }, [playing, onNext, onPrev]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 p-4 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => {
          if (repeat === 'ONE') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            onNext?.();
          }
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentTrack?.title || 'No track playing'}</p>
            <p className="text-xs text-neutral-500 truncate">{currentTrack?.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button onClick={() => setShuffle(!shuffle)} size="icon" variant="ghost" className={shuffle ? 'text-indigo-500' : 'text-neutral-400'}>
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button onClick={onPrev} size="icon" variant="ghost" className="text-neutral-400 hover:text-white">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button onClick={togglePlay} size="icon" className="bg-white text-black hover:scale-105 transition-transform">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button onClick={onNext} size="icon" variant="ghost" className="text-neutral-400 hover:text-white">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setRepeat(repeat === 'OFF' ? 'ALL' : repeat === 'ALL' ? 'ONE' : 'OFF')} 
              size="icon" 
              variant="ghost" 
              className={repeat !== 'OFF' ? 'text-indigo-500' : 'text-neutral-400'}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-neutral-500 w-12 text-right">{formatTime(progress)}</span>
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              onValueChange={(v) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = v[0];
                  setProgress(v[0]);
                }
              }}
              className="flex-1" 
            />
            <span className="text-xs text-neutral-500 w-12">{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button onClick={() => setMuted(!muted)} size="icon" variant="ghost" className="text-neutral-400 hover:text-white">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={[volume]} max={100} onValueChange={(v) => setVolume(v[0])} className="w-24" />
          </div>

          <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white">
            <ListMusic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}