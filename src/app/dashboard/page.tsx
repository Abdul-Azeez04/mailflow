'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const mockChartData = [
  { date: 'Jan 1', sent: 1200, opens: 480, clicks: 120 },
  { date: 'Jan 8', sent: 1800, opens: 720, clicks: 198 },
  { date: 'Jan 15', sent: 2200, opens: 990, clicks: 264 },
  { date: 'Jan 22', sent: 1950, opens: 858, clicks: 234 },
  { date: 'Jan 29', sent: 3100, opens: 1302, clicks: 403 },
  { date: 'Feb 5', sent: 2700, opens: 1188, clicks: 351 },
  { date: 'Feb 12', sent: 4200, opens: 1848, clicks: 546 },
];

const TOOLTIP_STYLE = {
  background: '#16161e',
  border: '1px solid #2a2a38',
  borderRadius: 8,
  color: '#f0f0fa',
  fontSize: 13,
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    contacts: 0,
    campaigns: 0,
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ws } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!ws) { setLoading(false); return; }
    setWorkspace(ws);

    const [contactsRes, campaignsRes] = await Promise.all([
      supabase.from('mf_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.id),
      supabase.from('mf_campaigns').select('*').eq('workspace_id', ws.id).order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      contacts: contactsRes.count || 0,
      campaigns: campaignsRes.data?.length || 0,
      emailsSent: ws.emails_sent_this_month || 0,
      openRate: 38.4,
      clickRate: 9.7,
    });
    setRecentCampaigns(campaignsRes.data || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      sent: 'badge-green',
      sending: 'badge-blue',
      scheduled: 'badge-yellow',
      draft: 'badge-gray',
      paused: 'badge-yellow',
    };
    return map[status] || 'badge-gray';
  };

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card skeleton h-28" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {workspace?.name || 'Your workspace'} — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <button className="btn btn-primary">
            <span>+</span> Create Campaign
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Contacts', value: stats.contacts.toLocaleString(), change: '+12%', icon: '👥', color: '#5562f5' },
          { label: 'Emails Sent (Month)', value: stats.emailsSent.toLocaleString(), change: '+34%', icon: '📤', color: '#22c55e' },
          { label: 'Avg Open Rate', value: `${stats.openRate}%`, change: '+2.1%', icon: '👁', color: '#f59e0b' },
          { label: 'Avg Click Rate', value: `${stats.clickRate}%`, change: '+0.8%', icon: '🖱️', color: '#a78bfa' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{stat.icon}</span>
              <span className="badge badge-green text-xs">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Main chart */}
        <div className="card p-6 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Email Performance</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Last 7 weeks</p>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#5562f5' }} /> Sent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#22c55e' }} /> Opens</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f59e0b' }} /> Clicks</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5562f5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#5562f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5a5a72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a5a72' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="sent" stroke="#5562f5" strokeWidth={2} fill="url(#sentGrad)" />
              <Line type="monotone" dataKey="opens" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { icon: '📧', label: 'New Campaign', href: '/dashboard/campaigns/new', color: '#5562f5' },
              { icon: '👤', label: 'Import Contacts', href: '/dashboard/contacts/import', color: '#22c55e' },
              { icon: '⚡', label: 'New Automation', href: '/dashboard/automations/new', color: '#f59e0b' },
              { icon: '🤖', label: 'AI Writer', href: '/dashboard/ai', color: '#a78bfa' },
              { icon: '🎨', label: 'Build Template', href: '/dashboard/templates/new', color: '#ec4899' },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors" style={{ background: 'var(--bg-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${a.color}22`, color: a.color }}>
                    {a.icon}
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold">Recent Campaigns</h2>
          <Link href="/dashboard/campaigns">
            <button className="btn btn-ghost text-xs">View all →</button>
          </Link>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="text-4xl mb-3">📧</div>
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm mt-1">Create your first campaign to get started</p>
            <Link href="/dashboard/campaigns/new">
              <button className="btn btn-primary mt-4">Create campaign</button>
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <span className="font-medium hover:text-brand-400 cursor-pointer">{c.name}</span>
                      </Link>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.subject}</div>
                    </td>
                    <td><span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
