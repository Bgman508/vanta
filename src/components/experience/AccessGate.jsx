import { useState } from 'react';
import { Lock, Unlock, DollarSign, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const tierIcons = {
  free: Unlock,
  paid: DollarSign,
  invite: Mail,
  event: Calendar
};

const tierLabels = {
  free: 'Free Access',
  paid: 'Purchase',
  invite: 'Invite Only',
  event: 'Event Access'
};

export default function AccessGate({ experience, user, evaluation, onUnlocked }) {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (!evaluation.matchedTier) return;

    setIsUnlocking(true);
    try {
      // Create attendance record
      const attendance = await base44.entities.Attendance.create({
        experienceId: experience.id,
        userId: user.id,
        tier: evaluation.matchedTier,
        amountPaid: evaluation.price || 0,
        territory: user.territory || 'US',
        attendedAt: new Date().toISOString()
      });

      // Update experience revenue and count
      const newRevenue = (experience.totalRevenue || 0) + (evaluation.price || 0);
      const newCount = (experience.attendanceCount || 0) + 1;

      await base44.entities.Experience.update(experience.id, {
        totalRevenue: newRevenue,
        attendanceCount: newCount
      });

      toast.success('Experience unlocked!');
      onUnlocked(attendance);
    } catch (error) {
      toast.error('Failed to unlock experience');
      console.error(error);
    } finally {
      setIsUnlocking(false);
    }
  };

  if (evaluation.allowed) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <Unlock className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-500">
          {evaluation.reason}
        </span>
      </div>
    );
  }

  const Icon = tierIcons[evaluation.matchedTier] || Lock;

  return (
    <div className="space-y-4">
      <div className="px-6 py-8 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-neutral-800/50 rounded-full">
            <Icon className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">
            {tierLabels[evaluation.matchedTier] || 'Access Required'}
          </h3>
          <p className="text-sm text-neutral-400">{evaluation.reason}</p>
        </div>

        {evaluation.requiresPayment && (
          <div className="text-3xl font-light text-white">
            ${(evaluation.price / 100).toFixed(2)}
          </div>
        )}

        {evaluation.matchedTier === 'paid' && evaluation.requiresPayment && (
          <Button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock Experience'}
          </Button>
        )}

        {evaluation.matchedTier === 'free' && (
          <Button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isUnlocking ? 'Unlocking...' : 'Get Free Access'}
          </Button>
        )}
      </div>
    </div>
  );
}