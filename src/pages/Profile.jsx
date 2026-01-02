import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Shield } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      setUser(user);
      setFormData({
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        territory: user.territory || 'US'
      });
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe(formData);
      toast.success('Profile updated');
      const updated = await base44.auth.me();
      setUser(updated);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center overflow-hidden">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-neutral-600" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-light">{user.full_name}</h1>
            <p className="text-neutral-400">{user.email}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <Shield className="w-5 h-5 text-indigo-500" />
          <div>
            <div className="text-sm text-neutral-400">Role</div>
            <div className="text-lg font-medium text-white">{user.role}</div>
          </div>
          {user.verified && (
            <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-xs font-medium">
              VERIFIED
            </span>
          )}
        </div>

        {/* Form */}
        <div className="space-y-6 p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <h2 className="text-xl font-medium text-white">Profile Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-400">Avatar URL</Label>
              <Input
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-400">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-400">Territory</Label>
              <Select
                value={formData.territory}
                onValueChange={(value) => setFormData({ ...formData, territory: value })}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}