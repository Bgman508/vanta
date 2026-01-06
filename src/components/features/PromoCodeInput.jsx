import { useState } from 'react';
import { Tag, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PromoCodeInput({ experienceId, originalPrice, onApply }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setChecking(true);
    try {
      const promos = await base44.entities.PromoCode.filter({ 
        code: code.trim().toUpperCase(),
        active: true
      });

      if (promos.length === 0) {
        toast.error('Invalid promo code');
        return;
      }

      const promo = promos[0];

      if (promo.experienceId && promo.experienceId !== experienceId) {
        toast.error('Code not valid for this experience');
        return;
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        toast.error('Promo code limit reached');
        return;
      }

      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        toast.error('Promo code expired');
        return;
      }

      let finalPrice = originalPrice;
      if (promo.discountType === 'FREE') {
        finalPrice = 0;
      } else if (promo.discountType === 'PERCENTAGE') {
        finalPrice = originalPrice * (1 - promo.discountValue / 100);
      } else if (promo.discountType === 'FIXED') {
        finalPrice = Math.max(0, originalPrice - promo.discountValue);
      }

      onApply({ finalPrice, promoId: promo.id, discount: promo.discountValue });
      toast.success('Promo code applied!');
    } catch (error) {
      toast.error('Failed to apply code');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PROMO CODE"
          className="pl-10 bg-neutral-800 border-neutral-700"
        />
      </div>
      <Button onClick={handleApply} disabled={checking || !code.trim()} variant="outline" className="border-neutral-700">
        Apply
      </Button>
    </div>
  );
}