import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function WaitlistManager({ experience, user }) {
  const [processing, setProcessing] = useState(null);

  const { data: preOrders, refetch } = useQuery({
    queryKey: ['waitlist', experience.id],
    queryFn: () => base44.entities.PreOrder.filter({ experienceId: experience.id, status: 'PENDING' }),
    initialData: []
  });

  const handleApprove = async (preOrder) => {
    setProcessing(preOrder.id);
    try {
      await base44.entities.PreOrder.update(preOrder.id, {
        status: 'FULFILLED',
        fulfilledAt: new Date().toISOString()
      });

      await base44.entities.Entitlement.create({
        userId: preOrder.userId,
        experienceId: experience.id,
        type: 'UNLOCK',
        status: 'ACTIVE',
        grantedBy: 'PURCHASE',
        receiptId: preOrder.receiptId
      });

      await base44.entities.Attendance.create({
        experienceId: experience.id,
        userId: preOrder.userId,
        tier: 'paid',
        amountPaid: preOrder.amountPaid,
        territory: 'US',
        attendedAt: new Date().toISOString()
      });

      toast.success('Waitlist entry approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (preOrder) => {
    setProcessing(preOrder.id);
    try {
      await base44.entities.PreOrder.update(preOrder.id, { status: 'REFUNDED' });
      toast.success('Waitlist entry rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Waitlist ({preOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {preOrders.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">No pending entries</p>
        ) : (
          preOrders.map(po => (
            <div key={po.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm text-white">{po.userId}</p>
                <p className="text-xs text-neutral-500">${(po.amountPaid / 100).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(po)}
                  disabled={processing === po.id}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleReject(po)}
                  disabled={processing === po.id}
                  size="sm"
                  variant="outline"
                  className="border-red-900 text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}