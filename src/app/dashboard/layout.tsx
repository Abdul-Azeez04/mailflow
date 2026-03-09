'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
    </svg>
  )},
  { href: '/dashboard/contacts', label: 'Contacts', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4Hac4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { href: '/dashboard/templates', label: 'Templates', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )},
  { href: '/dashboard/automations', label: 'Automations', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/>
    </svg>
  )},
  { href: '/dashboard/analytics', label: 'Analytics', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { href: '/dashboard/ai', label: 'AI Writer', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )},
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/auth/login'); return }
      setUser(session.user)
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setProfile(data) })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.replace('/auth/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.replace('/auth/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const emailsUsed = profile?.emails_sent_this_month || 0
  const emailsLimit = profile?.monthly_email_limit || 500
  const usagePercent = Math.min((emailsUsed / emailsLimit) * 100, 100)

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo */}
      <div style={{ padding:'20px 16px', borderBottom:'1px solid #1f1f1f' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#d4d4d4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e8e8e8', letterSpacing:'-0.02em' }}>MailFlow</div>
            <div style={{ fontSize: 11, color: '#5a5a5a', marginTop: 1 }}>{profile?.company_name || 'Free Plan'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'12px 10px', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ textDecoration:'none', display:'block', marginBottom: 2 }}>
            <div className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <span className="nav-icon" style={{ flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}

        <div style={{ borderTop:'1px solid #1f1f1f', margin:'12px 2px', paddingTop: 12 }}>
          <Link href="/dashboard/settings" onClick={() => setSidebarOpen(false)} style={{ textDecoration:'none', display:'block', marginBottom: 2 }}>
            <div className={`nav-item ${isActive('/dashboard/settings') ? 'active' : ''}`}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/>
                </svg>
              </span>
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Email usage */}
      <div style={{ padding:'14px 16px', borderTop:'1px solid #1f1f1f' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#5a5a5a', fontWeight: 500 }}>Monthly emails</span>
          <span style={{ fontSize: 12, color: '#8a8a8a' }}>{emailsUsed.toLocaleString()} / {emailsLimit.toLocaleString()}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${usagePercent}%` }} />
        </div>
        <div style={{ marginTop: 12, display:'flex', alignItems:'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#8a8a8a', fontWeight: 600 }}>
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#d4d4d4', fontWeight: 500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#5a5a5a' }}>Free plan</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#5a5a5a', padding: 4, borderRadius: 5, transition:'color 0.15s' }}
            title="Sign out"
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e8e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a5a5a')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0a0a' }}>
      {/* Desktop sidebar */}
      <div style={{
        width: 220,
        minHeight:'100vh',
        background:'#0d0d0d',
        borderRight:'1px solid #1f1f1f',
        position:'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        overflowY:'auto',
        zIndex: 50,
        display: 'none',
      }} className="sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset: 0, background:'rgba(0,0,0,0.6)', zIndex: 60, backdropFilter:'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div style={{
        width: 220,
        background:'#0d0d0d',
        borderRight:'1px solid #1f1f1f',
        position:'fixed',
        top: 0,
        left: sidebarOpen ? 0 : -220,
        bottom: 0,
        zIndex: 70,
        transition:'left 0.25s ease',
        overflowY:'auto',
      }}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 0, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* Top bar (mobile) */}
        <div style={{
          height: 52,
          background:'#0d0d0d',
          borderBottom:'1px solid #1f1f1f',
          display:'flex',
          alignItems:'center',
          padding:'0 16px',
          gap: 12,
          position:'sticky',
          top: 0,
          zYndex: 40,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#8a8a8a', padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#e8e8e8', letterSpacing:'-0.02em' }}>MailFlow</span>
        </div>

        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 1200, width:'100%', margin:'0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { display: block !important; }
          main { margin-left: 220px !important; }
          .sidebar-desktop + div { display: none !important; }
        }
      `}</style>
    </div>
  )
}
