import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function StatementExport({ receipts, experiences, orgName }) {
  const [period, setPeriod] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = () => {
    setIsExporting(true);

    try {
      // Filter by period if needed
      let filteredReceipts = receipts;
      if (period !== 'all') {
        const now = new Date();
        const cutoff = new Date();
        
        if (period === '30d') cutoff.setDate(now.getDate() - 30);
        else if (period === '90d') cutoff.setDate(now.getDate() - 90);
        else if (period === 'ytd') cutoff.setMonth(0, 1);

        filteredReceipts = receipts.filter(r => new Date(r.created_date) >= cutoff);
      }

      // Build CSV
      const headers = [
        'Date',
        'Experience',
        'Type',
        'User',
        'Amount',
        'Currency',
        'Payment ID',
        'Status'
      ];

      const rows = filteredReceipts.map(receipt => {
        const exp = experiences.find(e => e.id === receipt.experienceId);
        return [
          format(new Date(receipt.created_date), 'yyyy-MM-dd HH:mm:ss'),
          exp?.title || 'Unknown',
          exp?.type || '',
          receipt.userId,
          (receipt.amountCents / 100).toFixed(2),
          receipt.currency || 'USD',
          receipt.externalId || receipt.id,
          receipt.status
        ];
      });

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${orgName.replace(/\s+/g, '_')}_statement_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Statement exported successfully');
    } catch (error) {
      toast.error('Failed to export statement');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalRevenue = receipts
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + (r.amountCents || 0), 0);

  return (
    <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Export Statement</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Total Revenue: ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
        <FileText className="w-8 h-8 text-indigo-500" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Period</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="bg-neutral-900 border-neutral-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={exportCSV}
          disabled={isExporting || receipts.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <div className="pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          Statement includes all completed transactions. Refunds are marked separately.
        </p>
      </div>
    </div>
  );
}