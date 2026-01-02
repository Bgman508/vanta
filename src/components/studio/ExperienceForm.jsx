import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ExperienceForm({ user, experience, onSaved }) {
  const [formData, setFormData] = useState(experience || {
    type: 'album',
    title: '',
    description: '',
    coverUrl: '',
    contributors: [],
    media: [],
    accessRules: [{ tier: 'paid', price: 1999, territories: [], startTime: '', endTime: '' }],
    revenueRules: {
      artist: 50,
      label: 20,
      publisher: 10,
      producer: 10,
      platform: 10
    },
    interactionEnabled: false,
    liveCapable: false,
    state: 'draft'
  });

  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRevenueRule = (role, value) => {
    setFormData(prev => ({
      ...prev,
      revenueRules: {
        ...prev.revenueRules,
        [role]: parseFloat(value) || 0
      }
    }));
  };

  const addMediaItem = () => {
    setFormData(prev => ({
      ...prev,
      media: [...(prev.media || []), { title: '', type: 'audio', url: '', duration: 0 }]
    }));
  };

  const updateMediaItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMediaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    // Validate splits
    const total = Object.values(formData.revenueRules).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast.error(`Revenue splits must sum to 100% (currently ${total}%)`);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        ownerId: user.id,
        ownerName: user.full_name
      };

      let saved;
      if (experience?.id) {
        saved = await base44.entities.Experience.update(experience.id, payload);
      } else {
        saved = await base44.entities.Experience.create(payload);
      }

      toast.success(experience?.id ? 'Experience updated' : 'Experience created');
      onSaved(saved);
    } catch (error) {
      toast.error('Failed to save experience');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSplit = Object.values(formData.revenueRules).reduce((sum, val) => sum + val, 0);
  const splitValid = Math.abs(totalSplit - 100) < 0.01;

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-white">Basic Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-neutral-400">Type</Label>
            <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
              <SelectTrigger className="bg-neutral-900 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="album">Album</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-400">State</Label>
            <Select value={formData.state} onValueChange={(value) => updateField('state', value)}>
              <SelectTrigger className="bg-neutral-900 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-400">Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Experience title"
            className="bg-neutral-900 border-neutral-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-400">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe this experience..."
            rows={4}
            className="bg-neutral-900 border-neutral-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-400">Cover Image URL</Label>
          <Input
            value={formData.coverUrl}
            onChange={(e) => updateField('coverUrl', e.target.value)}
            placeholder="https://..."
            className="bg-neutral-900 border-neutral-800"
          />
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Media</h2>
          <Button
            onClick={addMediaItem}
            variant="outline"
            size="sm"
            className="border-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Track
          </Button>
        </div>

        <div className="space-y-3">
          {formData.media?.map((item, index) => (
            <div key={index} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Track {index + 1}</span>
                <Button
                  onClick={() => removeMediaItem(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={item.title}
                  onChange={(e) => updateMediaItem(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="bg-neutral-800 border-neutral-700"
                />
                <Input
                  value={item.url}
                  onChange={(e) => updateMediaItem(index, 'url', e.target.value)}
                  placeholder="URL"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Rules */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-white">Access Configuration</h2>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Tier</Label>
              <Select
                value={formData.accessRules?.[0]?.tier}
                onValueChange={(value) => {
                  const rules = [...(formData.accessRules || [])];
                  rules[0] = { ...rules[0], tier: value };
                  updateField('accessRules', rules);
                }}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="invite">Invite</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.accessRules?.[0]?.tier === 'paid' && (
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs">Price (cents)</Label>
                <Input
                  type="number"
                  value={formData.accessRules?.[0]?.price || 0}
                  onChange={(e) => {
                    const rules = [...(formData.accessRules || [])];
                    rules[0] = { ...rules[0], price: parseInt(e.target.value) || 0 };
                    updateField('accessRules', rules);
                  }}
                  placeholder="1999"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Revenue Splits</h2>
          <span className={`text-sm ${splitValid ? 'text-emerald-500' : 'text-red-500'}`}>
            Total: {totalSplit.toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Object.entries(formData.revenueRules).map(([role, value]) => (
            <div key={role} className="space-y-2">
              <Label className="text-neutral-400 text-xs uppercase">{role}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => updateRevenueRule(role, e.target.value)}
                className="bg-neutral-900 border-neutral-800"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <Button
          onClick={handleSave}
          disabled={isSaving || !splitValid}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? 'Saving...' : experience?.id ? 'Update' : 'Create'} Experience
        </Button>
      </div>
    </div>
  );
}