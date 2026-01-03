import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, DollarSign, TrendingUp, Globe, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlatformStats() {
  const { data: users } = useQuery({
    queryKey: ['platform-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000),
    initialData: []
  });

  const { data: experiences } = useQuery({
    queryKey: ['platform-experiences'],
    queryFn: () => base44.entities.Experience.list('-created_date', 1000),
    initialData: []
  });

  const { data: receipts } = useQuery({
    queryKey: ['platform-receipts'],
    queryFn: () => base44.entities.Receipt.list('-created_date', 1000),
    initialData: []
  });

  const { data: attendances } = useQuery({
    queryKey: ['platform-attendances'],
    queryFn: () => base44.entities.Attendance.list('-created_date', 1000),
    initialData: []
  });

  const totalRevenue = receipts.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amountCents, 0);
  const artists = users.filter(u => ['ARTIST', 'LABEL'].includes(u.role)).length;
  const fans = users.filter(u => u.role === 'FAN').length;

  // Growth chart (last 30 days)
  const growthData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    const dayUsers = users.filter(u => {
      const created = new Date(u.created_date);
      return created.toDateString() === date.toDateString();
    }).length;

    const dayExps = experiences.filter(e => {
      const created = new Date(e.created_date);
      return created.toDateString() === date.toDateString();
    }).length;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: dayUsers,
      experiences: dayExps
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Total Users</CardTitle>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">{users.length}</div>
            <p className="text-xs text-neutral-500 mt-1">{artists} artists, {fans} fans</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Experiences</CardTitle>
              <Music className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">{experiences.length}</div>
            <p className="text-xs text-neutral-500 mt-1">{experiences.filter(e => e.state === 'live').length} live</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">${(totalRevenue / 100).toFixed(0)}</div>
            <p className="text-xs text-neutral-500 mt-1">All-time</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Unlocks</CardTitle>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">{attendances.length}</div>
            <p className="text-xs text-neutral-500 mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Growth (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="experiences" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}