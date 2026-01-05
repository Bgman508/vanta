import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, Users, Trash2, LogOut } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: () => user ? base44.entities.Session.filter({ userId: user.id }) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['user-receipts', user?.id],
    queryFn: () => user ? base44.entities.Receipt.filter({ userId: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const handleRevokeSession = async (sessionId) => {
    try {
      await base44.entities.Session.update(sessionId, { active: false });
      toast.success('Session revoked');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) return;

    try {
      await base44.auth.updateMe({ account_deleted: true });
      toast.success('Account deleted');
      setTimeout(() => base44.auth.logout(), 2000);
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Settings</h1>
        </div>

        <Tabs defaultValue="sessions">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="sessions">
              <Shield className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="danger">
              <Trash2 className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-6 space-y-4">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.filter(s => s.active).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{session.device || 'Unknown Device'}</p>
                      <p className="text-xs text-neutral-500">
                        {session.location} • Last active {format(new Date(session.lastActive || session.created_date), 'MMM d')}
                      </p>
                    </div>
                    <Button onClick={() => handleRevokeSession(session.id)} size="sm" variant="outline" className="border-red-900 text-red-500">
                      Revoke
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-4">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {receipts.map(receipt => (
                  <div key={receipt.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div>
                      <p className="text-sm text-white">${(receipt.amountCents / 100).toFixed(2)}</p>
                      <p className="text-xs text-neutral-500">{format(new Date(receipt.created_date), 'MMM d, yyyy')}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded">
                      {receipt.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Refer Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 mb-4">Share VANTA with friends and earn rewards.</p>
                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-2">Your referral code</p>
                  <p className="text-lg font-mono text-white">VANTA-{user.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="mt-6">
            <Card className="bg-red-950/20 border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Delete Account</h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button onClick={handleDeleteAccount} variant="outline" className="border-red-900 text-red-500">
                    Delete My Account
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Sign Out</h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    Sign out of your account on this device.
                  </p>
                  <Button onClick={() => base44.auth.logout()} variant="outline" className="border-neutral-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}