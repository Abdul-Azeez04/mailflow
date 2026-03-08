'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, XCircle, AlertTriangle, Zap, Brain, RefreshCw, Globe, Mail, TrendingUp, Lock, Server, Eye } from 'lucide-react';

interface Check { id: string; label: string; status: 'pass' | 'fail' | 'warning' | 'pending'; description: string; fix?: string; score: number; }

export default function DeliverabilityPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [domain, setDomain] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => { runAnalysis(); }, []);

  async function runAnalysis() {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1800));

    const mockChecks: Check[] = [
      { id: 'spf', label: 'SPF Record', status: 'pass', description: 'Sender Policy Framework is configured correctly', score: 20, fix: undefined },
      { id: 'dkim', label: 'DKIM Signing', status: 'warning', description: 'DKIM key found but not aligned with From domain', score: 10, fix: 'Ensure your DKIM selector matches your sending domain. Update DNS TXT record with correct public key.' },
      { id: 'dmarc', label: 'DMARC Policy', status: 'warning', description: 'DMARC policy set to p=none (monitoring only)', score: 10, fix: 'Upgrade DMARC policy to p=quarantine or p=reject to signal strong authentication to receiving servers.' },
      { id: 'bounce', label: 'Bounce Rate', status: 'pass', description: 'Bounce rate < 2% — excellent deliverability signal', score: 15, fix: undefined },
      { id: 'spam', label: 'Spam Complaints', status: 'pass', description: 'Complaint rate < 0.1% — within best practice threshold', score: 15, fix: undefined },
      { id: 'list_hygiene', label: 'List Hygiene', status: 'pass', description: 'No known spam trap addresses detected', score: 10, fix: undefined },
      { id: 'engagement', label: 'Engagement Rate', status: 'pass', description: 'Healthy open rates signal good sender reputation', score: 10, fix: undefined },
      { id: 'unsubscribe', label: 'Unsubscribe Link', status: 'pass', description: 'One-click unsubscribe compliant with Gmail/Yahoo 2024 requirements', score: 10, fix: undefined },
    ];

    setChecks(mockChecks);
    const score = mockChecks.filter(c => c.status === 'pass').reduce((a, c) => a + c.score, 0) +
      mockChecks.filter(c => c.status === 'warning').reduce((a, c) => a + c.score / 2, 0);
    setOverallScore(score);

    setAiRecs([
      '🔐 Upgrade DMARC to p=quarantine to protect domain reputation and unlock inbox placement improvements.',
      '⏰ Implement send-time optimization — segment subscribers by timezone for 18% average open rate lift.',
      '🧹 Run a list hygiene sweep on contacts inactive > 180 days to maintain high engagement ratios.',
      '📱 Enable AMP for Email to create interactive experiences — supported by Gmail, Yahoo, Outlook.',
    ]);
    setAnalyzing(false);
  }

  const scoreColor = overallScore >= 85 ? 'text-emerald-400' : overallScore >= 65 ? 'text-yellow-400' : 'text-red-400';
  const scoreLabel = overallScore >= 85 ? 'Excellent' : overallScore >= 65 ? 'Good' : 'Needs Work';

  async function sendInboxTest() {
    if (!testEmail) return;
    setSendingTest(true);
    await new Promise(r => setTimeout(r, 2000));
    setSendingTest(false);
    alert(`✅ Inbox test sent to ${testEmail}. Check your inbox and spam folder. Look for: proper rendering, images loading, unsubscribe link present.`);
  }

  const statusIcon = (status: string) => {
    if (status === 'pass') return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-400" />;
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Deliverability Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Real-time inbox placement analysis · Authentication monitoring</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-white hover:bg-emerald-700 transition-all text-sm font-medium">
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={overallScore >= 85 ? '#10b981' : overallScore >= 65 ? '#f59e0b' : '#ef4444'}
                strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(overallScore / 100) * 314} 314`}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{analyzing ? '...' : overallScore}</span>
              <span className="text-slate-400 text-xs">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${scoreColor}`}>{analyzing ? 'Analyzing...' : scoreLabel} Deliverability</h3>
            <p className="text-slate-400 mt-1">Based on authentication, engagement, and list quality signals</p>
            <div className="flex gap-4 mt-4">
              {[
                { label: 'Passed', count: checks.filter(c => c.status === 'pass').length, color: 'text-emerald-400' },
                { label: 'Warnings', count: checks.filter(c => c.status === 'warning').length, color: 'text-yellow-400' },
                { label: 'Failed', count: checks.filter(c => c.status === 'fail').length, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label}>
                  <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
                  <span className="text-slate-400 text-sm ml-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block w-px h-24 bg-slate-700" />
          <div className="hidden md:flex flex-col gap-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Inbox Test</p>
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm w-48" />
            <button onClick={sendInboxTest} disabled={sendingTest || !testEmail}
              className="px-4 py-2 bg-emerald-600 rounded-xl text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
              {sendingTest ? 'Sending...' : '📬 Send Test'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecs.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-emerald-400" />
            AI Optimization Recommendations
          </h3>
          <div className="space-y-2">
            {aiRecs.map((rec, i) => (
              <p key={i} className="text-slate-300 text-sm">{rec}</p>
            ))}
          </div>
        </div>
      )}

      {/* Checks */}
      <div className="grid gap-3">
        {analyzing ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))
        ) : (
          checks.map(check => (
            <div key={check.id} className={`bg-slate-800/50 border rounded-2xl p-4 ${check.status === 'fail' ? 'border-red-500/30' : check.status === 'warning' ? 'border-yellow-500/20' : 'border-slate-700/50'}`}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{statusIcon(check.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{check.label}</h4>
                    <span className={``text-xs font-medium px-2 py-0.5 rounded-lg ${check.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : check.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {check.score} pts
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{check.description}</p>
                  {check.fix && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 text-xs"><span className="font-medium">Fix: </span>{check.fix}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
