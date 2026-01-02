import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { useAccessEvaluation } from '../components/rights/AccessEvaluator';
import AccessGate from '../components/experience/AccessGate';
import ExperiencePlayer from '../components/experience/ExperiencePlayer';
import RevenueDisplay from '../components/revenue/RevenueEngine';
import { Button } from '@/components/ui/button';

export default function ExperienceDetail() {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const experienceId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: experience, isLoading } = useQuery({
    queryKey: ['experience', experienceId],
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
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Experience not found</div>
      </div>
    );
  }

  const isOwner = user?.id === experience.ownerId;
  const hasAccess = evaluation.allowed || isOwner;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Cover + Info */}
          <div className="space-y-8">
            {/* Cover */}
            <div className="aspect-square bg-neutral-900 rounded-xl overflow-hidden">
              {experience.coverUrl ? (
                <img
                  src={experience.coverUrl}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                  <div className="text-9xl text-neutral-700">◆</div>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-neutral-900 rounded-full text-xs font-medium text-neutral-400 uppercase">
                  {experience.type}
                </span>
                <span className="px-3 py-1 bg-neutral-900 rounded-full text-xs font-medium text-emerald-500 uppercase">
                  {experience.state}
                </span>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-light mb-3">{experience.title}</h1>
                <p className="text-xl text-neutral-400">{experience.ownerName}</p>
              </div>

              {experience.description && (
                <p className="text-neutral-400 leading-relaxed">{experience.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-neutral-500">
                {experience.attendanceCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{experience.attendanceCount} unlocked</span>
                  </div>
                )}
                {experience.scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(experience.scheduledAt), 'MMMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Contributors */}
              {experience.contributors && experience.contributors.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 space-y-2">
                  <h3 className="text-sm font-medium text-neutral-400 uppercase">Contributors</h3>
                  <div className="flex flex-wrap gap-2">
                    {experience.contributors.map((contributor, i) => (
                      <div key={i} className="px-3 py-1 bg-neutral-900 rounded-full text-sm">
                        <span className="text-white">{contributor.name}</span>
                        <span className="text-neutral-500 ml-2">• {contributor.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Player / Access Gate */}
          <div className="space-y-8">
            {hasAccess ? (
              <>
                <ExperiencePlayer media={experience.media} />

                {/* Revenue Display (Owner Only) */}
                {isOwner && (
                  <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                    <RevenueDisplay experience={experience} />
                  </div>
                )}
              </>
            ) : (
              <div className="sticky top-24">
                <AccessGate
                  experience={experience}
                  user={user}
                  evaluation={evaluation}
                  onUnlocked={setAttendance}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}