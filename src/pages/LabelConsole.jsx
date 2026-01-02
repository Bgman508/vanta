import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Building2, Users, CheckSquare, FileText, Settings } from 'lucide-react';
import ApprovalQueue from '../components/label/ApprovalQueue';
import StatementExport from '../components/label/StatementExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LabelConsole() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('approvals');

  useEffect(() => {
    base44.auth.me().then(async user => {
      if (user.role !== 'LABEL' && user.role !== 'ADMIN') {
        window.location.href = '/';
        return;
      }
      setUser(user);

      // Find or create org
      const orgs = await base44.entities.Organization.filter({ ownerId: user.id });
      if (orgs.length > 0) {
        setOrg(orgs[0]);
      }
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: approvals, refetch: refetchApprovals } = useQuery({
    queryKey: ['approvals', org?.id],
    queryFn: () => org ? base44.entities.ExperienceApproval.filter({ orgId: org.id }, '-created_date') : [],
    enabled: !!org,
    initialData: []
  });

  const { data: experiences } = useQuery({
    queryKey: ['all-experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 500),
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['org-receipts'],
    queryFn: () => base44.entities.Receipt.list('-created_date', 1000),
    initialData: []
  });

  const { data: memberships } = useQuery({
    queryKey: ['org-memberships', org?.id],
    queryFn: () => org ? base44.entities.OrgMembership.filter({ orgId: org.id }) : [],
    enabled: !!org,
    initialData: []
  });

  const handleCreateOrg = async (name) => {
    try {
      const newOrg = await base44.entities.Organization.create({
        name,
        type: 'LABEL',
        ownerId: user.id,
        verified: false
      });

      await base44.entities.OrgMembership.create({
        orgId: newOrg.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      });

      setOrg(newOrg);
      toast.success('Organization created');
    } catch (error) {
      toast.error('Failed to create organization');
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-3xl font-light mb-2">Create Your Label</h1>
            <p className="text-neutral-400">Set up your organization to get started</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.orgName.value;
              if (name.trim()) handleCreateOrg(name);
            }}
            className="space-y-4"
          >
            <Input
              name="orgName"
              placeholder="Label name"
              className="bg-neutral-900 border-neutral-800"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Organization
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light mb-2">{org.name}</h1>
            <p className="text-neutral-400">Label Console</p>
          </div>
          {org.verified && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm font-medium">
              VERIFIED
            </span>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="approvals">
              <CheckSquare className="w-4 h-4 mr-2" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="statements">
              <FileText className="w-4 h-4 mr-2" />
              Statements
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-6">
            <ApprovalQueue
              approvals={approvals}
              experiences={experiences}
              onUpdate={refetchApprovals}
            />
          </TabsContent>

          <TabsContent value="statements" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
                  {receipts.length === 0 ? (
                    <p className="text-center py-8 text-neutral-500">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {receipts.slice(0, 10).map(receipt => {
                        const exp = experiences.find(e => e.id === receipt.experienceId);
                        return (
                          <div
                            key={receipt.id}
                            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">
                                {exp?.title || 'Unknown'}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(receipt.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">
                                ${(receipt.amountCents / 100).toFixed(2)}
                              </p>
                              <p className="text-xs text-neutral-500">{receipt.status}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <StatementExport
                  receipts={receipts}
                  experiences={experiences}
                  orgName={org.name}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <h3 className="text-lg font-medium text-white mb-4">
                Team Members ({memberships.length})
              </h3>
              <div className="space-y-2">
                {memberships.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{member.userId}</p>
                      <p className="text-xs text-neutral-500">{member.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      member.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' :
                      'bg-amber-500/20 text-amber-500'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-4">Organization Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Name</label>
                    <Input
                      value={org.name}
                      disabled
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Type</label>
                    <Input
                      value={org.type}
                      disabled
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Status</label>
                    <Input
                      value={org.verified ? 'Verified' : 'Unverified'}
                      disabled
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}