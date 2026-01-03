import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PromoCodeInput({ experienceId, originalPrice, onApply }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);

  const validateCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const codes = await base44.entities.PromoCode.filter({
        code: code.toUpperCase(),
        active: true
      });

      if (codes.length === 0) {
        toast.error('Invalid promo code');
        return;
      }

      const promo = codes[0];

      if (promo.experienceId && promo.experienceId !== experienceId) {
        toast.error('Code not valid for this experience');
        return;
      }

      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        toast.error('Code has expired');
        return;
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        toast.error('Code usage limit reached');
        return;
      }

      let discount = 0;
      if (promo.discountType === 'FREE') {
        discount = originalPrice;
      } else if (promo.discountType === 'PERCENTAGE') {
        discount = Math.floor((originalPrice * promo.discountValue) / 100);
      } else if (promo.discountType === 'FIXED') {
        discount = promo.discountValue;
      }

      const finalPrice = Math.max(0, originalPrice - discount);

      setApplied({ code: promo.code, discount, finalPrice });
      onApply({ promoId: promo.id, finalPrice });
      toast.success('Promo code applied!');
    } catch (error) {
      toast.error('Failed to validate code');
    } finally {
      setLoading(false);
    }
  };

  const removeCode = () => {
    setApplied(null);
    setCode('');
    onApply(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            disabled={!!applied}
            className="pl-10 bg-neutral-800 border-neutral-700"
          />
        </div>
        {applied ? (
          <Button onClick={removeCode} variant="outline" className="border-neutral-700">
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={validateCode} disabled={loading || !code.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            Apply
          </Button>
        )}
      </div>

      {applied && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <Check className="w-4 h-4 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-500">{applied.code} Applied</p>
            <p className="text-xs text-emerald-600">Saved ${(applied.discount / 100).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}