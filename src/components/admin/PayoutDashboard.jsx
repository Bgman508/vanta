import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PayoutDashboard({ user }) {
  const { data: receipts } = useQuery({
    queryKey: ['payout-receipts'],
    queryFn: () => base44.entities.Receipt.list('-created_date', 1000),
    initialData: []
  });

  const { data: experiences } = useQuery({
    queryKey: ['payout-experiences'],
    queryFn: () => base44.entities.Experience.filter({ ownerId: user.id }),
    initialData: []
  });

  // Calculate artist earnings
  const artistEarnings = experiences.reduce((total, exp) => {
    const artistSplit = exp.revenueRules?.artist || 0;
    return total + ((exp.totalRevenue || 0) * artistSplit / 100);
  }, 0);

  const paidOut = 0; // Track actual payouts when payment system integrated
  const pending = artistEarnings - paidOut;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Total Earned</CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">${(artistEarnings / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Pending</CardTitle>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">${(pending / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Paid Out</CardTitle>
              <Download className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">${(paidOut / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
        <h3 className="text-lg font-medium text-white mb-4">Payout Details</h3>
        
        <div className="space-y-3">
          {experiences.map(exp => {
            const artistSplit = exp.revenueRules?.artist || 0;
            const earned = ((exp.totalRevenue || 0) * artistSplit) / 100;

            return (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{exp.title}</p>
                  <p className="text-xs text-neutral-500">{artistSplit}% of ${(exp.totalRevenue / 100).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">${(earned / 100).toFixed(2)}</p>
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 mb-4">
            Payouts are processed monthly. Connect your payment method to receive earnings.
          </p>
          <Button disabled className="w-full bg-indigo-600 hover:bg-indigo-700">
            Request Payout (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}