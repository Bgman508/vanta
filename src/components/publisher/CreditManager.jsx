import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/20', label: 'Pending' },
  UNDER_REVIEW: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Under Review' },
  RESOLVED: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: 'Resolved' },
  REJECTED: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Rejected' },
  ESCALATED: { icon: AlertCircle, color: 'text-purple-500', bg: 'bg-purple-500/20', label: 'Escalated' }
};

export default function CreditManager({ user, experiences, disputes, onUpdate }) {
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState('');
  const [disputeType, setDisputeType] = useState('MISSING_CREDIT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get experiences where user is a contributor
  const myExperiences = experiences.filter(exp => 
    exp.contributors?.some(c => c.userId === user.id)
  );

  const handleSubmitDispute = async () => {
    if (!selectedExperience || !description.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.CreditDispute.create({
        experienceId: selectedExperience,
        disputedBy: user.id,
        disputeType,
        description,
        status: 'PENDING'
      });

      // Log action
      await base44.entities.AuditLog.create({
        userId: user.id,
        action: 'CREATE',
        entityType: 'CreditDispute',
        entityId: selectedExperience,
        metadata: { type: disputeType }
      });

      toast.success('Dispute submitted');
      setShowNewDispute(false);
      setSelectedExperience('');
      setDescription('');
      onUpdate();
    } catch (error) {
      toast.error('Failed to submit dispute');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Credit Disputes</h3>
          <p className="text-sm text-neutral-400 mt-1">
            {disputes.length} total dispute{disputes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowNewDispute(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          File Dispute
        </Button>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No disputes filed
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => {
            const experience = experiences.find(e => e.id === dispute.experienceId);
            const config = statusConfig[dispute.status];
            const Icon = config.icon;

            return (
              <div
                key={dispute.id}
                className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">
                        {experience?.title || 'Unknown Experience'}
                      </h4>
                      <Badge className={`${config.bg} ${config.color} border-0`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {dispute.disputeType.replace(/_/g, ' ')} • Filed {format(new Date(dispute.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 mb-3">{dispute.description}</p>

                {dispute.resolution && (
                  <div className="p-3 bg-neutral-800/50 rounded border border-neutral-700">
                    <p className="text-xs text-neutral-400 mb-1">Resolution</p>
                    <p className="text-sm text-neutral-300">{dispute.resolution}</p>
                    {dispute.resolvedAt && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Resolved {format(new Date(dispute.resolvedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Dispute Dialog */}
      <Dialog open={showNewDispute} onOpenChange={setShowNewDispute}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">File Credit Dispute</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Experience</label>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {myExperiences.map(exp => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Dispute Type</label>
              <Select value={disputeType} onValueChange={setDisputeType}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MISSING_CREDIT">Missing Credit</SelectItem>
                  <SelectItem value="INCORRECT_ROLE">Incorrect Role</SelectItem>
                  <SelectItem value="SPLIT_DISPUTE">Split Dispute</SelectItem>
                  <SelectItem value="REMOVAL_REQUEST">Removal Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowNewDispute(false)}
              variant="outline"
              className="border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDispute}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}