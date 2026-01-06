import { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RevenueCalculator() {
  const [price, setPrice] = useState(1999);
  const [unlocks, setUnlocks] = useState(100);

  const splits = {
    artist: 50,
    label: 20,
    publisher: 10,
    producer: 10,
    platform: 10
  };

  const totalRevenue = price * unlocks;

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Revenue Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 mb-2 block">Price (cents)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-2 block">Expected Unlocks</label>
            <Input
              type="number"
              value={unlocks}
              onChange={(e) => setUnlocks(parseInt(e.target.value) || 0)}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Total Revenue</span>
            <span className="text-white font-medium">${(totalRevenue / 100).toFixed(2)}</span>
          </div>
          {Object.entries(splits).map(([role, pct]) => (
            <div key={role} className="flex justify-between text-xs">
              <span className="text-neutral-500 capitalize">{role}</span>
              <span className="text-neutral-400">${((totalRevenue * pct / 100) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}