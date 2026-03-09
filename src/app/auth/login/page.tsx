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
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', padding: 20 }}>
      <div style={{ width:'100%', maxWidth: 400 }}>
          <div style={{ textAlign:'center', marginBottom: 40 }}>
          <p style={{ color: '#5a5a5a', fontSize: 14 }}>Sign in to your account</p>
          </div>
        <div style={{ background:'#111111', border:'1px solid #2a2a2a', borderRadius: 14, padding: 32 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', padding:'11px 16px', fontSize: 15 }} disabled={loading}>
  + {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign:'center' }}>
            <span style={{ color:'#5a5a5a', fontSize: 14 }}>Don't have an account? </span>
            <Link href="/auth/signup" style={{ color:'#d4d4d4', fontSize: 14, fontWeight: 500 }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
