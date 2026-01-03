import { useState } from 'react';
import { Ticket, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InviteCodeGenerator({ experience, user }) {
  const [codes, setCodes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const code = `VANTA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      const promo = await base44.entities.PromoCode.create({
        code,
        createdBy: user.id,
        experienceId: experience.id,
        discountType: 'FREE',
        discountValue: 100,
        maxUses: 10,
        usedCount: 0,
        active: true
      });

      setCodes([promo, ...codes]);
      toast.success('Invite code created');
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Code copied');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Invite Codes
          </CardTitle>
          <Button onClick={generateCode} disabled={generating} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            Generate Code
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {codes.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No codes generated yet
          </p>
        ) : (
          codes.map(promo => (
            <div key={promo.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm font-mono text-white">{promo.code}</p>
                <p className="text-xs text-neutral-500">
                  {promo.usedCount || 0} / {promo.maxUses} used
                </p>
              </div>
              <Button
                onClick={() => copyCode(promo.code)}
                size="icon"
                variant="ghost"
                className="text-neutral-400 hover:text-white"
              >
                {copied === promo.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}