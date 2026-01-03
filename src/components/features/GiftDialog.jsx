import { useState } from 'react';
import { Gift as GiftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function GiftDialog({ experience, user }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGift = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Valid email required');
      return;
    }

    setLoading(true);
    try {
      const price = experience.accessRules?.[0]?.price || 0;
      
      await base44.entities.Gift.create({
        fromUserId: user.id,
        toEmail: email,
        experienceId: experience.id,
        message: message || `${user.full_name} gifted you an experience!`,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      await base44.entities.AuditLog.create({
        userId: user.id,
        action: 'CREATE',
        entityType: 'Gift',
        entityId: experience.id,
        metadata: { toEmail: email, amount: price }
      });

      toast.success(`Gift sent to ${email}!`);
      setOpen(false);
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send gift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-neutral-700">
          <GiftIcon className="w-4 h-4 mr-2" />
          Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Gift Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-neutral-800/50 rounded-lg">
            <p className="text-sm font-medium text-white">{experience.title}</p>
            <p className="text-xs text-neutral-400">{experience.ownerName}</p>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Recipient Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="bg-neutral-800 border-neutral-700"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Personal Message (Optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note..."
              rows={3}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline" className="border-neutral-700">
            Cancel
          </Button>
          <Button onClick={handleGift} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Sending...' : 'Send Gift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}