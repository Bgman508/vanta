import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, Music, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PlatformStats from '../components/analytics/PlatformStats';
import ExportData from '../components/features/ExportData';

export default function Admin() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user.role !== 'ADMIN') {
        window.location.href = '/';
        return;
      }
      setUser(user);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: !!user,
    initialData: []
  });

  const { data: experiences } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 500),
    enabled: !!user,
    initialData: []
  });

  const { data: reports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 100),
    enabled: !!user,
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['admin-receipts'],
    queryFn: () => base44.entities.Receipt.list('-created_date', 500),
    enabled: !!user,
    initialData: []
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
    enabled: !!user,
    initialData: []
  });

  const handleResolveReport = async (report, resolution) => {
    try {
      await base44.entities.Report.update(report.id, {
        status: resolution,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        resolution: resolution === 'RESOLVED' ? 'Content reviewed and actioned' : 'Report dismissed'
      });

      toast.success(`Report ${resolution.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  if (!user) return null;

  const totalRevenue = receipts.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amountCents, 0);
  const pendingReports = reports.filter(r => r.status === 'PENDING').length;
  const activeUsers = users.filter(u => u.role !== 'ADMIN').length;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">{activeUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">Experiences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">{experiences.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">${(totalRevenue / 100).toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-white">{pendingReports}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="experiences">
              <Music className="w-4 h-4 mr-2" />
              Experiences
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Activity className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <PlatformStats />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-3">
              {reports.filter(r => r.status === 'PENDING').map(report => (
                <div key={report.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{report.entityType}</Badge>
                        <Badge className="bg-red-500/20 text-red-500 border-0">{report.reason}</Badge>
                      </div>
                      <p className="text-sm text-neutral-300 mb-2">{report.description}</p>
                      <p className="text-xs text-neutral-500">
                        Reported {format(new Date(report.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleResolveReport(report, 'RESOLVED')} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        Resolve
                      </Button>
                      <Button onClick={() => handleResolveReport(report, 'DISMISSED')} size="sm" variant="outline" className="border-neutral-700">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingReports === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  No pending reports
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="mb-4">
              <ExportData data={users} filename="vanta_users" format="csv" />
            </div>
            <div className="space-y-2">
              {users.slice(0, 20).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{u.full_name}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </div>
                  <Badge variant="outline">{u.role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experiences" className="mt-6">
            <div className="mb-4">
              <ExportData data={experiences} filename="vanta_experiences" format="csv" />
            </div>
            <div className="space-y-2">
              {experiences.slice(0, 20).map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{exp.title}</p>
                    <p className="text-xs text-neutral-500">{exp.ownerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{exp.type}</Badge>
                    <Badge className={exp.state === 'live' ? 'bg-emerald-500/20 text-emerald-500 border-0' : 'bg-neutral-700 text-neutral-400 border-0'}>
                      {exp.state}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <div className="mb-4">
              <ExportData data={auditLogs} filename="vanta_audit_logs" format="csv" />
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 50).map(log => (
                <div key={log.id} className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-xs text-neutral-500">{log.entityType}</span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {format(new Date(log.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">User: {log.userId}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}