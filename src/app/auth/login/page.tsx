'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      router.replace('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#d4d4d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 8L10.89 13.26C11.22 13.48 11.61 13.6 12 13.6C12.39 13.6 12.78 13.48 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#e8e8e8', letterSpacing: '-0.03em' }}>MailFlow</span>
          </div>
          <p style={{ color: '#5a5a5a', fontSize: 14 }}>Sign in to your account</p>
        </div>
        <div style={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 32 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px 16px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ color: '#5a5a5a', fontSize: 14 }}>Don't have an account? </span>
            <Link href="/auth/signup" style={{ color: '#d4d4d4', fontSize: 14, fontWeight: 500 }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
