import { useState } from 'react';
import { CheckSquare, Download, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BatchActions({ items, onUpdate, type = 'experience' }) {
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const handleBatchArchive = async () => {
    if (selected.size === 0) return;

    setProcessing(true);
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          base44.entities.Experience.update(id, { state: 'archived' })
        )
      );
      toast.success(`${selected.size} experience(s) archived`);
      setSelected(new Set());
      onUpdate();
    } catch (error) {
      toast.error('Failed to archive');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) return;

    setProcessing(true);
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          base44.entities.Experience.delete(id)
        )
      );
      toast.success(`${selected.size} item(s) deleted`);
      setSelected(new Set());
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
      <Checkbox
        checked={selected.size === items.length}
        onCheckedChange={toggleSelectAll}
      />
      <span className="text-sm text-neutral-400">
        {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
      </span>

      {selected.size > 0 && (
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={handleBatchArchive}
            disabled={processing}
            size="sm"
            variant="outline"
            className="border-neutral-700"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button
            onClick={handleBatchDelete}
            disabled={processing}
            size="sm"
            variant="outline"
            className="border-red-900 text-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}