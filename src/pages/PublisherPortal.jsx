import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Music, DollarSign, AlertCircle, FileText } from 'lucide-react';
import CreditManager from '../components/publisher/CreditManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublisherPortal() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: experiences } = useQuery({
    queryKey: ['all-experiences-publisher'],
    queryFn: () => base44.entities.Experience.list('-created_date', 500),
    initialData: []
  });

  const { data: disputes, refetch: refetchDisputes } = useQuery({
    queryKey: ['my-disputes', user?.id],
    queryFn: () => user ? base44.entities.CreditDispute.filter({ disputedBy: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['all-receipts-publisher'],
    queryFn: () => base44.entities.Receipt.list('-created_date', 1000),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  // Calculate contributor stats
  const myCredits = experiences.filter(exp =>
    exp.contributors?.some(c => c.userId === user.id)
  );

  const totalRevenue = myCredits.reduce((sum, exp) => {
    const myContribution = exp.contributors.find(c => c.userId === user.id);
    if (!myContribution) return sum;
    
    const publisherSplit = exp.revenueRules?.publisher || 0;
    return sum + ((exp.totalRevenue || 0) * publisherSplit / 100);
  }, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light mb-2">Publisher Portal</h1>
          <p className="text-neutral-400">Manage credits and earnings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">Credits</CardTitle>
                <Music className="w-4 h-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">{myCredits.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Experiences</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">Earnings</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">${(totalRevenue / 100).toFixed(2)}</div>
              <p className="text-xs text-neutral-500 mt-1">Total revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">Disputes</CardTitle>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">{disputes.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Filed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="credits">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="credits">
              <Music className="w-4 h-4 mr-2" />
              My Credits
            </TabsTrigger>
            <TabsTrigger value="disputes">
              <AlertCircle className="w-4 h-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="statements">
              <FileText className="w-4 h-4 mr-2" />
              Statements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="mt-6">
            <div className="space-y-3">
              {myCredits.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                  No credits found
                </div>
              ) : (
                myCredits.map(exp => {
                  const myContribution = exp.contributors.find(c => c.userId === user.id);
                  const myShare = exp.revenueRules?.publisher || 0;
                  const myEarnings = ((exp.totalRevenue || 0) * myShare) / 100;

                  return (
                    <div
                      key={exp.id}
                      className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-neutral-800 rounded overflow-hidden">
                            {exp.coverUrl ? (
                              <img src={exp.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600">◆</div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium text-white mb-1">{exp.title}</h4>
                            <p className="text-sm text-neutral-400">
                              {myContribution?.role || 'Contributor'} • {exp.ownerName}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2">
                              {myShare}% publisher share
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${(myEarnings / 100).toFixed(2)}</p>
                          <p className="text-xs text-neutral-500">Earned</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-6">
            <CreditManager
              user={user}
              experiences={experiences}
              disputes={disputes}
              onUpdate={refetchDisputes}
            />
          </TabsContent>

          <TabsContent value="statements" className="mt-6">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center">
              <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Statements</h3>
              <p className="text-sm text-neutral-400">
                Detailed statements will be available here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}