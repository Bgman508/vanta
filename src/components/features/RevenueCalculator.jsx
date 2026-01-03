import { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function RevenueCalculator() {
  const [price, setPrice] = useState(1499);
  const [splits, setSplits] = useState({ artist: 50, label: 20, publisher: 10, producer: 15, platform: 5 });
  const [units, setUnits] = useState(100);

  const totalRevenue = price * units;
  const payouts = {
    artist: Math.floor((totalRevenue * splits.artist) / 100),
    label: Math.floor((totalRevenue * splits.label) / 100),
    publisher: Math.floor((totalRevenue * splits.publisher) / 100),
    producer: Math.floor((totalRevenue * splits.producer) / 100),
    platform: Math.floor((totalRevenue * splits.platform) / 100)
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Revenue Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-neutral-400 mb-2 block">Price (cents)</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            className="bg-neutral-800 border-neutral-700"
          />
          <p className="text-xs text-neutral-500 mt-1">${(price / 100).toFixed(2)} per unlock</p>
        </div>

        <div>
          <label className="text-sm text-neutral-400 mb-2 block">Estimated Units: {units}</label>
          <Slider
            value={[units]}
            onValueChange={([val]) => setUnits(val)}
            min={10}
            max={1000}
            step={10}
            className="mt-2"
          />
        </div>

        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total Revenue</span>
            <span className="text-lg font-medium text-white">${(totalRevenue / 100).toFixed(2)}</span>
          </div>

          {Object.entries(payouts).map(([role, amount]) => (
            <div key={role} className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 capitalize">{role} ({splits[role]}%)</span>
              <span className="text-neutral-300">${(amount / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}