'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockChartData = [
  { date: 'Mon', opens: 420, clicks: 180 },
  { date: 'Tue', opens: 380, clicks: 140 },
  { date: 'Wed', opens: 560, clicks: 240 },
  { date: 'Thu', opens: 490, clicks: 200 },
  { date: 'Fri', opens: 720, clicks: 310 },
  { date: 'Sat', opens: 350, clicks: 130 },
  { date: 'Sun', opens: 280, clicks: 100 },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ campaigns: 0, contacts: 0, opens: 0, clicks: 0 })
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [campaignsRes, contactsRes] = await Promise.all([
      supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    const campaigns = campaignsRes.data || []
    const totalOpens = campaigns.reduce((s: number, c: any) => s + (c.opens || 0), 0)
    const totalClicks = campaigns.reduce((s: number, c: any) => s + (c.clicks || 0), 0)

    setStats({
      campaigns: campaigns.length,
      contacts: contactsRes.count || 0,
      opens: totalOpens,
      clicks: totalClicks,
    })
    setRecentCampaigns(campaigns.slice(0, 5))
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Campaigns', value: stats.campaigns, icon: '📧', color: '#60a5fa', change: '+12%' },
    { label: 'Total Contacts', value: stats.contacts.toLocaleString(), icon: '👥', color: '#34d399', change: '+8%' },
    { label: 'Total Opens', value: stats.opens.toLocaleString(), icon: '👁', color: '#fb923c', change: '+23%' },
    { label: 'Total Clicks', value: stats.clicks.toLocaleString(), icon: '🔗', color: '#a78bfa', change: '+18%' },
  ]

  const statusColor: Record<string, string> = {
    sent: 'badge-green',
    draft: 'badge-ash',
    scheduled: 'badge-blue',
    sending: 'badge-orange',
    paused: 'badge-red',
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 28, flexWrap:'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e8e8e8', letterSpacing:'-0.03em', marginBottom: 4 }}>Overview</h1>
          <p style={{ color: '#5a5a5a', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
          </p>
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

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            {loading ? (
              <>
                <div className="skeleton" style={{ height: 14, width: 100, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 28, width: 70 }} />
              </>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#5a5a5a', fontWeight: 600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{card.label}</span>
                  <span style={{ fontSize: 18 }}>{card.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#e8e8e8', letterSpacing:'-0.03em', marginBottom: 6 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: '#22c55e' }}>{card.change} this month</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap: 16, marginBottom: 24 }}>
        {/* Chart */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#d4d4d4' }}>Engagement — Last 7 days</h2>
            <div style={{ display:'flex', gap: 14 }}>
              <span style={{ fontSize: 12, color: '#60a5fa', display:'flex', alignItems:'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background:'#60a5fa', display:'inline-block' }} />
                Opens
              </span>
              <span style={{ fontSize: 12, color: '#34d399', display:'flex', alignItems:'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background:'#34d399', display:'inline-block' }} />
                Clicks
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="opens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill:'#5a5a5a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#5a5a5a', fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background:'#1f1f1f', border:'1px solid #2a2a2a', borderRadius: 8, color:'#e8e8e8', fontSize: 13 }} />
              <Area type="monotone" dataKey="opens" stroke="#60a5fa" strokeWidth={2} fill="url(#opens)" />
              <Area type="monotone" dataKey="clicks" stroke="#34d399" strokeWidth={2} fill="url(#clicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#d4d4d4', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            {[
              { label: 'Create Campaign', href: '/dashboard/campaigns/new', icon: '📧', desc: 'Write and send emails' },
              { label: 'Import Contacts', href: '/dashboard/contacts', icon: '📥', desc: 'Upload CSV file' },
              { label: 'Browse Templates', href: '/dashboard/templates', icon: '🎨', desc: 'Pre-built designs' },
              { label: 'Set Up Automation', href: '/dashboard/automations', icon: '⚡', desc: 'Automate workflows' },
              { label: 'AI Email Writer', href: '/dashboard/ai', icon: '🤖', desc: 'Generate with AI' },
            ].map(action => (
              <Link key={action.href} href={action.href} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'9px 10px', borderRadius: 8, border:'1px solid #1f1f1f', transition:'all 0.15s', cursor:'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f1f' }}
                >
                  <span style={{ fontSize: 18 }}>{action.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#d4d4d4' }}>{action.label}</div>
                    <div style={{ fontSize: 11, color: '#5a5a5a' }}>{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #1f1f1f', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#d4d4d4' }}>Recent Campaigns</h2>
          <Link href="/dashboard/campaigns" style={{ fontSize: 13, color: '#8a8a8a', textDecoration:'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4d4d4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8a8a8a')}
          >
            View all →
          </Link>
        </div>
        {recentCampaigns.length === 0 ? (
          <div style={{ padding:'48px 20px', textAlign:'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
            <div style={{ color: '#5a5a5a', fontSize: 14, marginBottom: 16 }}>No campaigns yet. Create your first one!</div>
            <Link href="/dashboard/campaigns/new">
              <button className="btn-primary">Create Campaign</button>
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border:'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map(c => (
                  <tr key={c.id} style={{ cursor:'pointer' }} onClick={() => router.push('/dashboard/campaigns')}>
                    <td>
                      <div style={{ fontWeight: 500, color: '#d4d4d4' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#5a5a5a', marginTop: 2 }}>{c.subject}</div>
                    </td>
                    <td><span className={`badge ${statusColor[c.status] || 'badge-ash'}`}>{c.status}</span></td>
                    <td style={{ color:'#8a8a8a' }}>{(c.total_recipients || 0).toLocaleString()}</td>
                    <td style={{ color:'#8a8a8a' }}>{(c.opens || 0).toLocaleString()}</td>
                    <td style={{ color:'#8a8a8a' }}>{(c.clicks || 0).toLocaleString()}</td>
                    <td style={{ color:'#5a5a5a', fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
