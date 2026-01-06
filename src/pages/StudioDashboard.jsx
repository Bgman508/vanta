import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, FolderOpen, Upload, Settings, DollarSign, Ticket } from 'lucide-react';
import StudioAnalytics from '../components/analytics/StudioAnalytics';
import ExperienceForm from '../components/studio/ExperienceForm';
import PayoutDashboard from '../components/admin/PayoutDashboard';
import InviteCodeGenerator from '../components/features/InviteCodeGenerator';
import DistributionHub from '../components/creator/DistributionHub';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function StudioDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!['ARTIST', 'LABEL', 'ADMIN'].includes(user.role)) {
        window.location.href = '/';
        return;
      }
      setUser(user);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: experiences, refetch: refetchExperiences } = useQuery({
    queryKey: ['my-experiences', user?.id],
    queryFn: () => user ? base44.entities.Experience.filter({ ownerId: user.id }, '-created_date') : [],
    enabled: !!user,
    initialData: []
  });

  const experienceIds = experiences.map(e => e.id);

  const { data: attendances } = useQuery({
    queryKey: ['my-attendances', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const all = await base44.entities.Attendance.list('-created_date', 1000);
      return all.filter(a => experienceIds.includes(a.experienceId));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['my-receipts', experienceIds.join(',')],
    queryFn: async () => {
      if (experienceIds.length === 0) return [];
      const all = await base44.entities.Receipt.list('-created_date', 1000);
      return all.filter(r => experienceIds.includes(r.experienceId));
    },
    enabled: experienceIds.length > 0,
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light mb-2">Studio Dashboard</h1>
          <p className="text-neutral-400">
            {experiences.length} experience{experiences.length !== 1 ? 's' : ''} • {attendances.length} total unlocks
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="experiences">
              <FolderOpen className="w-4 h-4 mr-2" />
              Experiences
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <DollarSign className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="invites">
              <Ticket className="w-4 h-4 mr-2" />
              Invite Codes
            </TabsTrigger>
            <TabsTrigger value="create">
              <Upload className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <StudioAnalytics
              experiences={experiences}
              attendances={attendances}
              receipts={receipts}
            />
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <PayoutDashboard user={user} />
          </TabsContent>

          <TabsContent value="invites" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {experiences.map(exp => (
                <InviteCodeGenerator key={exp.id} experience={exp} user={user} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experiences" className="mt-6">
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-neutral-500 mb-4">No experiences yet</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Your First Experience
                  </Button>
                </div>
              ) : (
                experiences.map(exp => (
                  <div
                    key={exp.id}
                    className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                        {exp.coverUrl ? (
                          <img src={exp.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-2xl">
                            ◆
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-medium text-white">{exp.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                            exp.state === 'live' ? 'bg-emerald-500/20 text-emerald-500' :
                            exp.state === 'draft' ? 'bg-neutral-700 text-neutral-400' :
                            'bg-amber-500/20 text-amber-500'
                          }`}>
                            {exp.state}
                          </span>
                        </div>

                        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                          {exp.description || 'No description'}
                        </p>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Unlocks</span>
                            <p className="text-white font-medium">{exp.attendanceCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Revenue</span>
                            <p className="text-white font-medium">${((exp.totalRevenue || 0) / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Type</span>
                            <p className="text-white font-medium capitalize">{exp.type}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Created</span>
                            <p className="text-white font-medium">{format(new Date(exp.created_date), 'MMM d')}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedExperience(exp);
                          setShowForm(true);
                          setActiveTab('create');
                        }}
                        variant="outline"
                        className="border-neutral-700"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <div className="max-w-3xl">
              <ExperienceForm
                user={user}
                experience={showForm ? selectedExperience : null}
                onSaved={() => {
                  setShowForm(false);
                  setSelectedExperience(null);
                  refetchExperiences();
                  setActiveTab('experiences');
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}