import { useState, useEffect } from 'react';
import { Clock, Users, MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ExperiencePlayer from '../experience/ExperiencePlayer';

export default function EventRoom({ experience, hasAccess, user }) {
  const [countdown, setCountdown] = useState(null);
  const [eventState, setEventState] = useState('upcoming'); // upcoming, live, replay, ended
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { user: 'System', message: 'Welcome to the event!', timestamp: new Date() }
  ]);

  useEffect(() => {
    if (!experience.scheduledAt) return;

    const checkEventState = () => {
      const now = new Date();
      const start = new Date(experience.scheduledAt);
      const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration
      const replayEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000); // 24h replay

      if (now < start) {
        setEventState('upcoming');
        setCountdown(start - now);
      } else if (now >= start && now < end) {
        setEventState('live');
        setCountdown(null);
      } else if (now >= end && now < replayEnd) {
        setEventState('replay');
        setCountdown(null);
      } else {
        setEventState('ended');
        setCountdown(null);
      }
    };

    checkEventState();
    const interval = setInterval(checkEventState, 1000);
    return () => clearInterval(interval);
  }, [experience.scheduledAt]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !hasAccess) return;

    setChatMessages(prev => [...prev, {
      user: user?.full_name || 'Anonymous',
      message: chatMessage,
      timestamp: new Date()
    }]);
    setChatMessage('');
  };

  const formatCountdown = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Event Status Bar */}
      <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {eventState === 'live' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-500 uppercase">Live Now</span>
                </div>
                <div className="h-4 w-px bg-neutral-700" />
              </>
            )}

            {eventState === 'upcoming' && countdown && (
              <>
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">
                  Starts in {formatCountdown(countdown)}
                </span>
                <div className="h-4 w-px bg-neutral-700" />
              </>
            )}

            {eventState === 'replay' && (
              <>
                <Badge className="bg-purple-500/20 text-purple-500 border-0">
                  Replay Available
                </Badge>
                <div className="h-4 w-px bg-neutral-700" />
              </>
            )}

            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Users className="w-4 h-4" />
              <span>{experience.attendanceCount || 0} attending</span>
            </div>
          </div>

          {hasAccess && eventState !== 'ended' && (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-0">
              Access Granted
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video/Player */}
        <div className="lg:col-span-2 space-y-4">
          {hasAccess && (eventState === 'live' || eventState === 'replay') ? (
            <ExperiencePlayer media={experience.media} />
          ) : eventState === 'ended' ? (
            <div className="aspect-video bg-neutral-900 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-3">
                <Clock className="w-12 h-12 text-neutral-600 mx-auto" />
                <p className="text-neutral-500">Event has ended</p>
                <p className="text-sm text-neutral-600">Replay window expired</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-neutral-900 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-4">
                {!hasAccess ? (
                  <>
                    <Lock className="w-12 h-12 text-neutral-600 mx-auto" />
                    <p className="text-neutral-500">Ticket required to access this event</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-neutral-600 mx-auto" />
                    <p className="text-neutral-500">Event starts soon</p>
                    {countdown && (
                      <p className="text-2xl font-light text-white">{formatCountdown(countdown)}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Event Info */}
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <h2 className="text-2xl font-light text-white mb-2">{experience.title}</h2>
            <p className="text-neutral-400 mb-4">{experience.description}</p>
            
            {experience.contributors && experience.contributors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {experience.contributors.map((c, i) => (
                  <Badge key={i} variant="outline" className="border-neutral-700">
                    {c.name} • {c.role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                <h3 className="font-medium text-white">Live Chat</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-indigo-400">{msg.user}</span>
                    <span className="text-xs text-neutral-600">
                      {msg.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-neutral-800">
              {hasAccess && (eventState === 'live' || eventState === 'replay') ? (
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send a message..."
                    className="bg-neutral-800 border-neutral-700"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    Send
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-center text-neutral-500">
                  {!hasAccess ? 'Get a ticket to join the chat' : 'Chat opens when event starts'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}