import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, User, Lock, Bell, CreditCard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Account() {
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
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light mb-2">Account Settings</h1>
          <p className="text-neutral-400">Manage your profile and security</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            {/* User Info Card */}
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-neutral-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-light text-white">{user.full_name}</h2>
                  <p className="text-neutral-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-indigo-500 font-medium">{user.role}</span>
                    {user.verified && (
                      <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-xs">
                        VERIFIED
                      </span>
                    )}
                  </div>
                </div>
              </div>

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
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <h3 className="text-lg font-medium text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Email Verification</h4>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">Your email is verified</p>
                </div>

                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                    <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-400 rounded">
                      Available Soon
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Password</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Change your password regularly to keep your account secure
                  </p>
                  <Button variant="outline" className="border-neutral-700" disabled>
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
              <p className="text-sm text-neutral-400">
                Notification settings will be available soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <h3 className="text-lg font-medium text-white mb-4">Billing & Payments</h3>
              <p className="text-sm text-neutral-400">
                Payment methods and billing history will be available soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}