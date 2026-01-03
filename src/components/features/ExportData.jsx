import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ExportData({ data, filename, format = 'json' }) {
  const handleExport = () => {
    try {
      let content, type, ext;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        type = 'application/json';
        ext = 'json';
      } else if (format === 'csv') {
        if (data.length === 0) {
          toast.error('No data to export');
          return;
        }
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
          headers.map(h => `"${row[h] || ''}"`).join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        type = 'text/csv';
        ext = 'csv';
      }

      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <Button onClick={handleExport} size="sm" variant="outline" className="border-neutral-700">
      <Download className="w-4 h-4 mr-2" />
      Export {format.toUpperCase()}
    </Button>
  );
}