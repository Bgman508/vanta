import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FileUploader({ onUpload, accept = '*', label = 'Upload File' }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast.success('File uploaded');
      onUpload?.(file_url);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input type="file" accept={accept} onChange={handleUpload} className="hidden" disabled={uploading} />
      <Button type="button" variant="outline" disabled={uploading} className="w-full border-neutral-800">
        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {uploading ? 'Uploading...' : label}
      </Button>
    </label>
  );
}