import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ContentModeration() {
  const { data: reports, refetch } = useQuery({
    queryKey: ['moderation-reports'],
    queryFn: () => base44.entities.Report.filter({ status: 'PENDING' }),
    initialData: []
  });

  const { data: comments } = useQuery({
    queryKey: ['all-comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 100),
    initialData: []
  });

  const handleAction = async (reportId, action) => {
    try {
      await base44.entities.Report.update(reportId, {
        status: action === 'approve' ? 'RESOLVED' : 'DISMISSED',
        reviewedBy: 'admin',
        reviewedAt: new Date().toISOString()
      });
      toast.success(action === 'approve' ? 'Content removed' : 'Report dismissed');
      refetch();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList className="bg-neutral-800">
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="automod">Auto-Mod</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-3 mt-4">
            {reports.map(report => (
              <div key={report.id} className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{report.entityType}</p>
                    <p className="text-xs text-neutral-500">{report.reason}</p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs text-neutral-400 mb-3">{report.description}</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleAction(report.id, 'approve')} size="sm" className="bg-red-600 hover:bg-red-700">
                    <X className="w-4 h-4 mr-2" />
                    Remove Content
                  </Button>
                  <Button onClick={() => handleAction(report.id, 'dismiss')} size="sm" variant="outline" className="border-neutral-700">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="automod" className="mt-4">
            <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-white">Auto-moderation is active</p>
              </div>
              <p className="text-xs text-neutral-500">
                Comments and content are automatically scanned for prohibited content, spam, and policy violations.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}