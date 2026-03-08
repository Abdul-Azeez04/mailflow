'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    loadCampaigns();
  }, [filter]);

  const loadCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: ws } = await supabase.from('workspaces').select('*').eq('owner_id', user.id).single();
    if (!ws) return;
    setWorkspace(ws);
    let q = supabase.from('mf_campaigns').select('*, mf_campaign_stats(*)').eq('workspace_id', ws.id).order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setCampaigns(data || []);
    setLoading(false);
  };

  const duplicateCampaign = async (c: any) => {
    const { data } = await supabase.from('mf_campaigns').insert({
      workspace_id: workspace.id,
      name: c.name + ' (Copy)',
      subject: c.subject,
      preview_text: c.preview_text,
      from_name: c.from_name,
      from_email: c.from_email,
      html_content: c.html_content,
      status: 'draft',
    }).select().single();
    if (data) {
      toast.success('Campaign duplicated');
      loadCampaigns();
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await supabase.from('mf_campaigns').delete().eq('id', id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success('Campaign deleted');
  };

  const statusColors: Record<string, string> = {
    draft: 'badge-gray',
    scheduled: 'badge-yellow',
    sending: 'badge-blue',
    sent: 'badge-green',
    paused: 'badge-yellow',
    cancelled: 'badge-red',
  };

  return (
    <div className="p-8 animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <button className="btn btn-primary">+ New Campaign</button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'scheduled', 'sending', 'sent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn text-sm capitalize ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-20 skeleton" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card p-16 text-center" style={{ color: 'var(--text-secondary)' }}>
          <div className="text-5xl mb-4">📧</div>
          <h3 className="font-semibold text-lg mb-2">No campaigns found</h3>
          <p className="text-sm mb-6">Create your first campaign to start reaching your audience</p>
          <Link href="/dashboard/campaigns/new">
            <button className="btn btn-primary">Create campaign</button>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Type</th>
                <th>Opens</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const stats = c.mf_campaign_stats?.[0];
                const openRate = stats?.total_sent > 0 ? ((stats.unique_opens / stats.total_sent) * 100).toFixed(1) : '—';
                const clickRate = stats?.total_sent > 0 ? ((stats.unique_clicks / stats.total_sent) * 100).toFixed(1) : '—';
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <div className="font-medium hover:text-brand-400 cursor-pointer">{c.name}</div>
                      </Link>
                      <div className="text-xs mt-0.5 truncate max-w-64" style={{ color: 'var(--text-muted)' }}>{c.subject}</div>
                    </td>
                    <td><span className={`badge ${statusColors[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                    <td className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{c.type}</td>
                    <td className="text-sm">{openRate !== '—' ? `${openRate}%` : openRate}</td>
                    <td className="text-sm">{clickRate !== '—' ? `${clickRate}%` : clickRate}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/campaigns/${c.id}/edit`}>
                          <button className="btn btn-ghost text-xs px-2 py-1">Edit</button>
                        </Link>
                        <button onClick={() => duplicateCampaign(c)} className="btn btn-ghost text-xs px-2 py-1">Copy</button>
                        <button onClick={() => deleteCampaign(c.id)} className="btn btn-ghost text-xs px-2 py-1" style={{ color: 'var(--danger)' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
