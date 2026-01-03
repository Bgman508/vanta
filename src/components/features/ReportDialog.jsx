import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReportDialog({ entityType, entityId, user }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('INAPPROPRIATE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!description.trim()) {
      toast.error('Description required');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Report.create({
        reportedBy: user.id,
        entityType,
        entityId,
        reason,
        description,
        status: 'PENDING'
      });

      toast.success('Report submitted');
      setOpen(false);
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-neutral-500 hover:text-red-500">
          <AlertTriangle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Report Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INAPPROPRIATE">Inappropriate Content</SelectItem>
                <SelectItem value="COPYRIGHT">Copyright Violation</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="HARASSMENT">Harassment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the issue..."
              rows={4}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline" className="border-neutral-700">
            Cancel
          </Button>
          <Button onClick={handleReport} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}