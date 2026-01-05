import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function VerificationQueue() {
  const { data: requests, refetch } = useQuery({
    queryKey: ['verification-requests'],
    queryFn: () => base44.entities.VerificationRequest.filter({ status: 'PENDING' }),
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['verify-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: []
  });

  const handleApprove = async (request) => {
    try {
      await base44.entities.VerificationRequest.update(request.id, {
        status: 'APPROVED',
        reviewedBy: 'admin'
      });

      const user = users.find(u => u.id === request.userId);
      if (user) {
        await base44.auth.updateMe({ verified: true });
      }

      toast.success('Verification approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (request) => {
    try {
      await base44.entities.VerificationRequest.update(request.id, {
        status: 'REJECTED',
        reviewedBy: 'admin',
        reviewNotes: 'Does not meet verification criteria'
      });

      toast.success('Verification rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const getUser = (id) => users.find(u => u.id === id);

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Verification Requests ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">No pending requests</p>
        ) : (
          requests.map(request => {
            const user = getUser(request.userId);
            return (
              <div key={request.id} className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{user?.full_name}</p>
                    <p className="text-xs text-neutral-500">{user?.email}</p>
                    <Badge variant="outline" className="mt-1">{request.type}</Badge>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {format(new Date(request.created_date), 'MMM d')}
                  </span>
                </div>

                {request.message && (
                  <p className="text-xs text-neutral-400">{request.message}</p>
                )}

                {request.proofUrls && request.proofUrls.length > 0 && (
                  <div className="flex gap-2">
                    {request.proofUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                        Proof {i + 1} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(request)} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(request)} size="sm" variant="outline" className="border-red-900 text-red-500">
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}