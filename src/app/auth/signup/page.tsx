'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) { toast.error('Please fill required fields'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: company },
        emailRedirectTo: `${location.origin}/dashboard`
      }
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else if (data.user && data.session) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email: email, full_name: fullName, company_name: company,
        plan: 'free', monthly_email_limit: 500, emails_sent_this_month: 0
      })
      toast.success('Account created!')
      router.replace('/dashboard')
    } else {
      toast.success('Check your email to confirm your account')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', padding: 20 }}>
      <div style={{ width:'100%', maxWidth: 420 }}>
        <div style={{ textAlign:'center', marginBottom: 40 }}>
          <p style={{ color: '#5a5a5a', fontSize: 14 }}>Create your free account</p>
        </div>
        <div style={{ background:'#111111', border:'1px solid #2a2a2a', borderRadius: 14, padding: 32 }}>
          <div style={{ background:'#0d2e1a', border:'1px solid #1a4a2a', borderRadius: 8, padding:'10px 14px', marginBottom: 24, display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ color:'#22c55e', fontSize: 18 }}>✓</span>
            <div>
              <div style={{ color:'#22c55e', fontSize: 13, fontWeight: 600 }}>Free Plan — No credit card required</div>
              <div style={{ color:'#5a8a6a', fontSize: 12, marginTop: 2 }}>500 emails/month · Unlimited contacts · All features</div>
            </div>
          </div>
          <form onSubmit={handleSignup}>
            <div style={{ display:'grid', gridTemplateColumns:'|fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label className="label">Full name *</label><input type="text" className="input" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div><label className="label">Company</label><input type="text" className="input" placeholder="Acme Inc" value={company} onChange={e => setCompany(e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label className="label">Email *</label><input type="email" className="input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></div>
            <div style={{ marginBottom: 24 }}><label className="label">Password *</label><input type="password" className="input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></div>
            <button type="submit" className="btn-primary" style={{ width:'100%', padding:'11px 16px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign:'center' }}>
            <span style={{ color:'#5a5a5a', fontSize: 14 }}>Already have an account? </span>
            <Link href="/auth/login" style={{ color:'#d4d4d4', fontSize: 14, fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
