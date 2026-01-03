import { TrendingUp, Users, DollarSign, Globe, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TerritoryMap from './TerritoryMap';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function StudioAnalytics({ experiences, attendances, receipts }) {
  // Calculate metrics
  const totalUnlocks = attendances.length;
  const totalRevenue = receipts.reduce((sum, r) => sum + (r.amountCents || 0), 0);
  const avgRevenuePerUnlock = totalUnlocks > 0 ? totalRevenue / totalUnlocks : 0;

  // Territory breakdown
  const territoryData = attendances.reduce((acc, a) => {
    const territory = a.territory || 'Unknown';
    acc[territory] = (acc[territory] || 0) + 1;
    return acc;
  }, {});

  const territoryChart = Object.entries(territoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Experience performance
  const experiencePerformance = experiences.map(exp => ({
    name: exp.title.substring(0, 20),
    unlocks: exp.attendanceCount || 0,
    revenue: (exp.totalRevenue || 0) / 100
  })).slice(0, 5);

  // Time series (mock - last 7 days)
  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayAttendances = attendances.filter(a => {
      const aDate = new Date(a.created_date);
      return aDate.toDateString() === date.toDateString();
    });

    return {
      date: dateStr,
      unlocks: dayAttendances.length,
      revenue: dayAttendances.reduce((sum, a) => sum + (a.amountPaid || 0), 0) / 100
    };
  });

  // Tier breakdown
  const tierData = attendances.reduce((acc, a) => {
    const tier = a.tier || 'unknown';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const tierChart = Object.entries(tierData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Total Unlocks</CardTitle>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">{totalUnlocks}</div>
            <p className="text-xs text-neutral-500 mt-1">All-time</p>
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
            <div className="text-3xl font-light text-white">${(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-neutral-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Avg Per Unlock</CardTitle>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">${(avgRevenuePerUnlock / 100).toFixed(2)}</div>
            <p className="text-xs text-neutral-500 mt-1">Average value</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400">Experiences</CardTitle>
              <BarChart3 className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-white">{experiences.length}</div>
            <p className="text-xs text-neutral-500 mt-1">Published</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Time Series */}
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeSeriesData}>
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
                <Bar dataKey="unlocks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Territory Breakdown */}
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Territories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {territoryChart.map((item, i) => {
                const percentage = totalUnlocks > 0 ? (item.value / totalUnlocks) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{item.name}</span>
                      <span className="text-neutral-500">{item.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Experience Performance */}
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Experience Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={experiencePerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="name" stroke="#666" style={{ fontSize: '11px' }} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="unlocks" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Access Tier Distribution */}
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Access Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tierChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Territory Map */}
      <TerritoryMap attendances={attendances} />
    </div>
  );
}