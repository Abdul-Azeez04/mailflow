'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  sent: 'badge-green', draft: 'badge-ash', scheduled: 'badge-blue', sending: 'badge-orange', paused: 'badge-red'
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { loadCampaigns() }, [])

  const loadCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); setDeleting(null); return }
    toast.success('Campaign deleted')
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  const duplicateCampaign = async (campaign: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('campaigns').insert({
      user_id: user.id,
      name: `${campaign.name} (Copy)`,
      subject: campaign.subject,
      preview_text: campaign.preview_text,
      from_name: campaign.from_name,
      from_email: campaign.from_email,
      reply_to: campaign.reply_to,
      content: campaign.content,
      status: 'draft',
    }).select().single()
    if (error) { toast.error('Failed to duplicate'); return }
    toast.success('Campaign duplicated')
    setCampaigns(prev => [data, ...prev])
  }

  const filtered = campaigns.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.subject?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const openRate = (c: any) => c.total_recipients > 0 ? ((c.opens / c.total_recipients) * 100).toFixed(1) : '—'
  const clickRate = (c: any) => c.total_recipients > 0 ? ((c.clicks / c.total_recipients) * 100).toFixed(1) : '—'

  return (
    <div className="animate-fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 24, flexWrap:'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e8e8e8', letterSpacing:'-0.03em', marginBottom: 4 }}>Campaigns</h1>
          <p style={{ color: '#5a5a5a', fontSize: 14 }}>{campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <button className="btn-primary" style={{ display:'flex', alignItems:'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Campaign
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap: 10, marginBottom: 18, flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input type="text" className="input" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 38 }} />
        </div>
        <div style={{ display:'flex', gap: 4, background:'#111111', border:'1px solid #2a2a2a', borderRadius: 8, padding: 3 }}>
          {['all', 'draft', 'scheduled', 'sending', 'sent'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding:'5px 12px', borderRadius: 6, border:'none', fontSize: 13, fontWeight: 500, cursor:'pointer', background: filter === s ? '#2a2a2a' : 'transparent', color: filter === s ? '#e8e8e8' : '#5a5a5a', transition:'all 0.15s', textTransform:'capitalize' }}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding:'60px 20px', textAlign:'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📭!</div>
          <div style={{ color: '#8a8a8a', fontSize: 15, marginBottom: 8, fontWeight: 500 }}>{search || filter !== 'all' ? 'No campaigns match your filters' : 'No campaigns yet'}</div>
          {!search && filter === 'all' && (<Link href="/dashboard/campaigns/new"><button className="btn-primary">Create Campaign</button></Link>)}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Campaign</th><th>Status</th><th>Recipients</th><th>Open rate</th><th>Click rate</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 500, color: '#d4d4d4', marginBottom: 2 }}>{c.name}</div><div style={{ fontSize: 12, color: '#5a5a5a' }}>{c.subject || 'No subject'}</div></td>
                  <td><span className={`badge ${STATUS_COLORS[c.status] || 'badge-ash'}`}>{c.status}</span></td>
                  <td style={{ color:'#8a8a8a' }}>{(c.total_recipients || 0).toLocaleString()}</td>
                  <td>{c.total_recipients > 0 ? <span style={{ color:'#34d399', fontWeight: 600 }}>{openRate(c)}%</span> : <span style={{ color:'#3a3a3a' }}>—</span>}</td>
                  <td>{c.total_recipients > 0 ? <span style={{ color:'#60a5fa', fontWeight: 600 }}>{clickRate(c)}%</span> : <span style={{ color:'#3a3a3a' }}>—</span>}</td>
                  <td style={{ color:'#5a5a5a', fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td><div style={{ display:'flex', gap: 6 }}>
                    {c.status === 'draft' && <button onClick={() => router.push(`/dashboard/campaigns/new?edit=${c.id}`)} className="btn-secondary" style={{ padding:'5px 12px', fontSize: 12 }}>Edit</button>}
                    <button onClick={() => duplicateCampaign(c)} style={{ background:'none', border:'1px solid #2a2a2a', borderRadius: 6, padding:'5px 10px', cursor:'pointer', color:'#5a5a5a', fontSize: 12 }}>onMouseEnter={e => (e.currentTarget.style.color='#d4d4d4')} onMouseLeave={e => (e.currentTarget.style.color='#5a5a5a')}>Copy</button>
                    <button onClick={() => deleteCampaign(c.id)} disabled={deleting === c.id} style={{ background:'none', border:'1px solid #2a1a1a', borderRadius: 6, padding:'5px 10px', cursor:'pointer', color:'#5a5a5a', fontSize: 12 }} onMouseEnter={e => (e.currentTarget.style.color='#ef4444')} onMouseLeave={e => (e.currentTarget.style.color='#5a5a5a')}>{doleting === c.id ? '...' : 'Del'}</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
