import { useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RefundManager({ receipt, experience, onRefunded }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error('Refund reason required');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Receipt.update(receipt.id, {
        status: 'REFUNDED',
        refundedAt: new Date().toISOString(),
        refundReason: reason
      });

      const entitlements = await base44.entities.Entitlement.filter({
        receiptId: receipt.id,
        status: 'ACTIVE'
      });

      for (const ent of entitlements) {
        await base44.entities.Entitlement.update(ent.id, { status: 'REFUNDED' });
      }

      await base44.entities.Experience.update(experience.id, {
        totalRevenue: Math.max(0, (experience.totalRevenue || 0) - receipt.amountCents),
        attendanceCount: Math.max(0, (experience.attendanceCount || 1) - 1)
      });

      await base44.entities.AuditLog.create({
        userId: user.id,
        action: 'REFUND',
        entityType: 'Receipt',
        entityId: receipt.id,
        metadata: { reason, experienceId: experience.id, amount: receipt.amountCents }
      });

      toast.success('Refund processed');
      setOpen(false);
      onRefunded?.();
    } catch (error) {
      toast.error('Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="border-red-900 text-red-500">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refund
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Process Refund</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Amount</span>
                <span className="text-lg font-medium text-white">${(receipt.amountCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Experience</span>
                <span className="text-sm text-white">{experience.title}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Refund Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain reason for refund..."
                rows={3}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-600">
                This will revoke user access, update revenue, and log the action.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline" className="border-neutral-700">
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}