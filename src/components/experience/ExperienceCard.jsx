import { Link } from 'react-router-dom';
import { Lock, Calendar, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const typeLabels = {
  album: 'ALBUM',
  single: 'SINGLE',
  event: 'EVENT',
  session: 'SESSION',
  archive: 'ARCHIVE'
};

const stateColors = {
  draft: 'text-neutral-500',
  scheduled: 'text-amber-500',
  live: 'text-emerald-500',
  archived: 'text-neutral-400',
  expired: 'text-red-500'
};

export default function ExperienceCard({ experience, hasAccess }) {
  return (
    <Link
      to={createPageUrl(`ExperienceDetail?id=${experience.id}`)}
      className="group block"
    >
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {experience.coverUrl ? (
          <img
            src={experience.coverUrl}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="text-6xl text-neutral-700">◆</div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Lock indicator */}
        {!hasAccess && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm p-2 rounded-lg">
            <Lock className="w-4 h-4 text-neutral-400" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-neutral-300">
            {typeLabels[experience.type]}
          </span>
        </div>

        {/* State indicator */}
        {experience.state !== 'live' && (
          <div className="absolute bottom-4 left-4">
            <span className={`text-xs font-medium uppercase ${stateColors[experience.state]}`}>
              {experience.state}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
          {experience.title}
        </h3>
        <p className="text-sm text-neutral-400">{experience.ownerName}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          {experience.scheduledAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(experience.scheduledAt), 'MMM d')}</span>
            </div>
          )}
          {experience.attendanceCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{experience.attendanceCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}