'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
      else setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4" style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg">MailFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <button className="btn btn-ghost">Sign in</button>
          </Link>
          <Link href="/auth/signup">
            <button className="btn btn-primary">Get started free</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(85,98,245,0.1)', border: '1px solid rgba(85,98,245,0.3)', color: '#7485ff' }}>
          <span>✨</span>
          <span>AI-powered email marketing platform</span>
        </div>
        
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Email marketing that<br/>
          <span className="gradient-text">writes itself</span>
        </h1>
        
        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Send AI-generated campaigns to millions of contacts. Built with automation workflows, real-time analytics, and a drag-and-drop editor. Compete with Mailchimp — for free.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Link href="/auth/signup">
            <button className="btn btn-primary text-base px-8 py-3">
              Start for free →
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="btn btn-secondary text-base px-8 py-3">
              View demo
            </button>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-6 text-left">
          {[
            { icon: '🤖', title: 'AI Email Writer', desc: 'Generate campaigns, subject lines, and copy with one click using Claude AI.' },
            { icon: '📊', title: 'Real-time Analytics', desc: 'Track opens, clicks, conversions, and revenue per campaign in live dashboards.' },
            { icon: '⚡', title: 'Visual Automations', desc: 'Build drip sequences, welcome flows, and behavioral triggers visually.' },
            { icon: '👥', title: 'CRM & Segmentation', desc: 'Import millions of contacts, tag them, score leads, and build dynamic segments.' },
            { icon: '🎨', title: 'Drag-Drop Builder', desc: 'Design responsive email templates with a visual block editor.' },
            { icon: '🔒', title: 'Deliverability', desc: 'SPF, DKIM, DMARC verification, domain warmup, and spam score analysis.' },
          ].map((f) => (
            <div key={f.title} className="card p-6 card-hover animate-fade-up">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="py-12 border-t border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 text-center">
          {[
            { val: '10M+', label: 'Emails sent' },
            { val: '99.9%', label: 'Uptime SLA' },
            { val: '< 1s', label: 'Avg delivery' },
            { val: '40%', label: 'Higher open rates with AI' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold gradient-text mb-1">{s.val}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        © 2025 MailFlow. Built with Next.js, Supabase, and Claude AI.
      </footer>
    </div>
  );
}
