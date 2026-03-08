'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const NAV = [
  { icon: '▦', label: 'Dashboard', href: '/dashboard' },
  { icon: '📧', label: 'Campaigns', href: '/dashboard/campaigns' },
  { icon: '👥', label: 'Contacts', href: '/dashboard/contacts' },
  { icon: '⚡', label: 'Automations', href: '/dashboard/automations' },
  { icon: '🎨', label: 'Templates', href: '/dashboard/templates' },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics' },
  { icon: '🤖', label: 'AI Writer', href: '/dashboard/ai' },
  { icon: '🔒', label: 'Deliverability', href: '/dashboard/deliverability' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      setUser(session.user);
      loadWorkspace(session.user.id);
    });
  }, [router]);

  const loadWorkspace = async (userId: string) => {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', userId)
      .single();
    if (data) setWorkspace(data);
  };

  const handleSignout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 border-r transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center glow-brand" style={{ background: 'var(--brand)' }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-base">MailFlow</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto btn-ghost p-1 rounded text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Workspace */}
        {!collapsed && workspace && (
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer" style={{ background: 'var(--bg-hover)' }}>
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: 'var(--brand)', color: 'white' }}>
                {workspace.name?.[0] || 'W'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{workspace.name}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{workspace.plan} plan</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleSignout}
            className="sidebar-item w-full"
            title={collapsed ? 'Sign out' : undefined}
          >
            <span className="text-base">🚪</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
