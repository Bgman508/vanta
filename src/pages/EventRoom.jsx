import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventRoomComponent from '../components/events/EventRoom';
import { useAccessEvaluation } from '../components/rights/AccessEvaluator';
import AccessGate from '../components/experience/AccessGate';

export default function EventRoom() {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const experienceId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: experience, isLoading } = useQuery({
    queryKey: ['experience-event', experienceId],
    queryFn: async () => {
      const list = await base44.entities.Experience.filter({ id: experienceId });
      return list[0];
    },
    enabled: !!experienceId
  });

  useEffect(() => {
    if (user && experienceId) {
      base44.entities.Attendance.filter({
        experienceId,
        userId: user.id
      }).then(list => {
        if (list.length > 0) {
          setAttendance(list[0]);
        }
      });
    }
  }, [user, experienceId]);

  const evaluation = useAccessEvaluation(experience, user, attendance);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading event...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Event not found</div>
      </div>
    );
  }

  if (experience.type !== 'event') {
    window.location.href = createPageUrl(`ExperienceDetail?id=${experienceId}`);
    return null;
  }

  const isOwner = user?.id === experience.ownerId;
  const hasAccess = evaluation.allowed || isOwner;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to experiences</span>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {!hasAccess ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-light mb-4">{experience.title}</h1>
              <p className="text-neutral-400">{experience.description}</p>
            </div>
            <AccessGate
              experience={experience}
              user={user}
              evaluation={evaluation}
              onUnlocked={setAttendance}
            />
          </div>
        ) : (
          <EventRoomComponent
            experience={experience}
            hasAccess={hasAccess}
            user={user}
          />
        )}
      </div>
    </div>
  );
}