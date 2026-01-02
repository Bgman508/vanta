import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const statusConfig = {
  SUBMITTED: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/20', label: 'Submitted' },
  UNDER_REVIEW: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Under Review' },
  APPROVED: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: 'Approved' },
  REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Rejected' },
  CHANGES_REQUESTED: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Changes Requested' }
};

export default function ApprovalQueue({ approvals, experiences, onUpdate }) {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getExperience = (experienceId) => {
    return experiences.find(e => e.id === experienceId);
  };

  const handleReview = async (approval, newStatus) => {
    if (!reviewNotes.trim() && newStatus !== 'APPROVED') {
      toast.error('Please provide review notes');
      return;
    }

    setIsProcessing(true);
    try {
      const user = await base44.auth.me();

      // Update approval
      await base44.entities.ExperienceApproval.update(approval.id, {
        status: newStatus,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || 'Approved'
      });

      // If approved, update experience state
      if (newStatus === 'APPROVED') {
        const experience = getExperience(approval.experienceId);
        if (experience && experience.state === 'draft') {
          await base44.entities.Experience.update(approval.experienceId, {
            state: 'live'
          });
        }
      }

      // Log action
      await base44.entities.AuditLog.create({
        userId: user.id,
        action: newStatus === 'APPROVED' ? 'APPROVE' : 'REJECT',
        entityType: 'ExperienceApproval',
        entityId: approval.id,
        metadata: {
          experienceId: approval.experienceId,
          notes: reviewNotes
        }
      });

      toast.success(`Experience ${newStatus.toLowerCase()}`);
      setSelectedApproval(null);
      setReviewNotes('');
      onUpdate();
    } catch (error) {
      toast.error('Failed to process review');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingApprovals = approvals.filter(a => 
    ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'].includes(a.status)
  );

  const reviewedApprovals = approvals.filter(a => 
    ['APPROVED', 'REJECTED'].includes(a.status)
  );

  return (
    <div className="space-y-6">
      {/* Pending Queue */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Pending Review ({pendingApprovals.length})
        </h3>
        
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No submissions pending review
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(approval => {
              const experience = getExperience(approval.experienceId);
              if (!experience) return null;

              const config = statusConfig[approval.status];
              const Icon = config.icon;

              return (
                <div
                  key={approval.id}
                  className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-16 h-16 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                        {experience.coverUrl ? (
                          <img src={experience.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">◆</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{experience.title}</h4>
                          <Badge className={`${config.bg} ${config.color} border-0`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-neutral-400">
                          {experience.ownerName} • {experience.type}
                        </p>

                        <p className="text-xs text-neutral-500 mt-2">
                          Submitted {format(new Date(approval.submittedAt || approval.created_date), 'MMM d, yyyy h:mm a')}
                        </p>

                        {approval.reviewNotes && (
                          <p className="text-xs text-neutral-400 mt-2 italic">
                            "{approval.reviewNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedApproval(approval);
                        setReviewNotes('');
                      }}
                      variant="outline"
                      size="sm"
                      className="border-neutral-700"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Recently Reviewed ({reviewedApprovals.length})
        </h3>
        
        <div className="space-y-2">
          {reviewedApprovals.slice(0, 5).map(approval => {
            const experience = getExperience(approval.experienceId);
            if (!experience) return null;

            const config = statusConfig[approval.status];
            const Icon = config.icon;

            return (
              <div
                key={approval.id}
                className="p-3 bg-neutral-900/30 border border-neutral-800 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden">
                      {experience.coverUrl ? (
                        <img src={experience.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">◆</div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-white">{experience.title}</p>
                      <p className="text-xs text-neutral-500">
                        {format(new Date(approval.reviewedAt || approval.updated_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <Badge className={`${config.bg} ${config.color} border-0`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Dialog */}
      {selectedApproval && (
        <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
          <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Review Submission</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {(() => {
                const exp = getExperience(selectedApproval.experienceId);
                if (!exp) return null;

                return (
                  <>
                    <div className="flex gap-4 p-4 bg-neutral-800/50 rounded-lg">
                      <div className="w-20 h-20 bg-neutral-800 rounded overflow-hidden">
                        {exp.coverUrl ? (
                          <img src={exp.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">◆</div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-1">{exp.title}</h4>
                        <p className="text-sm text-neutral-400">{exp.ownerName}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {exp.type} • {exp.media?.length || 0} tracks
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-400 mb-2">Description</p>
                      <p className="text-sm text-white">{exp.description || 'No description'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-400 mb-2">Revenue Splits</p>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(exp.revenueRules || {}).map(([role, percent]) => (
                          <div key={role} className="text-center p-2 bg-neutral-800/50 rounded">
                            <div className="text-xs text-neutral-500 uppercase">{role}</div>
                            <div className="text-sm font-medium text-white">{percent}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add feedback for the artist..."
                  rows={4}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => handleReview(selectedApproval, 'REJECTED')}
                disabled={isProcessing}
                variant="outline"
                className="border-red-900 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleReview(selectedApproval, 'CHANGES_REQUESTED')}
                disabled={isProcessing}
                variant="outline"
                className="border-orange-900 text-orange-500 hover:bg-orange-500/10"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
              <Button
                onClick={() => handleReview(selectedApproval, 'APPROVED')}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}