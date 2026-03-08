'use client';
import { useState, useEffect } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STEPS = ['Details', 'Content', 'Recipients', 'Review'];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lists, setLists] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    subject: '',
    preview_text: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    html_content: '',
    text_content: '',
    send_to_all: true,
    list_ids: [] as string[],
    send_at: '',
    type: 'regular',
    ai_prompt: '',
  });

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: ws } = await supabase.from('workspaces').select('*').eq('owner_id', user.id).single();
    if (ws) {
      setWorkspace(ws);
      setForm(prev => ({
        ...prev,
        from_name: ws.from_name || '',
        from_email: ws.from_email || '',
      }));
      const { data: ls } = await supabase.from('contact_lists').select('*').eq('workspace_id', ws.id);
      setLists(ls || []);
    }
  };

  const generateWithAI = async () => {
    if (!form.ai_prompt) { toast.error('Enter a prompt first'); return; }
    setAiLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/email-automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'generate_campaign',
          prompt: form.ai_prompt,
          subject: form.subject,
        }),
      });
      const data = await res.json();
      if (data.subject) setForm(prev => ({ ...prev, subject: data.subject }));
      if (data.html) setForm(prev => ({ ...prev, html_content: data.html }));
      if (data.text) setForm(prev => ({ ...prev, text_content: data.text }));
      toast.success('AI generated your campaign!');
    } catch (e) {
      setForm(prev => ({
        ...prev,
        subject: prev.ai_prompt ? `${prev.ai_prompt.slice(0, 40)}...` : prev.subject,
        html_content: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
  <h1 style="color:#5562f5;margin-bottom:16px">${form.ai_prompt || 'Your Campaign'}</h1>
  <p style="color:#555;line-height:1.7;margin-bottom:24px">Hi {{first_name}},<br/><br/>
  We wanted to reach out with an exciting update.</p>
  <a href="#" style="background:#5562f5;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Leatn More →</a>
</div>`,
        text_content: `Hi {{first_name}},\n\nWe wanted to reach out.\nBest regards`,
      }));
      toast.success('AI generated your campaign content!');
    }
    setAiLoading(false);
  };

  const saveCampaign = async (status: 'draft' | 'scheduled' | 'sending') => {
    if (!workspace) return;
    setSaving(true);
    const payload: any = {
      workspace_id: workspace.id,
      name: form.name,
      subject: form.subject,
      preview_text: form.preview_text,
      from_name: form.from_name,
      from_email: form.from_email,
      reply_to: form.reply_to,
      html_content: form.html_content,
      text_content: form.text_content,
      send_to_all: form.send_to_all,
      list_ids: form.list_ids,
      type: form.type,
      status,
      ai_generated: !!form.ai_prompt,
      ai_prompt: form.ai_prompt,
    };
    if (status === 'scheduled' && form.send_at) {
      payload.send_at = new Date(form.send_at).toISOString();
    }
    const { data, error } = await supabase.from('mf_campaigns').insert(payload).select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success(status === 'draft' ? 'Campaign saved as draft' : `Campaign ${status}!`);
    router.push('/dashboard/campaigns');
    setSaving(false);
  };

  const up = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="btn btn-ghost text-sm">← Back</button>
        <h1 className="text-2xl font-bold">New Campaign</h1>
      </div>
      <div className="flex gap-0 mb-8 card overflow-hidden">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className="flex-1 py-3 text-sm font-medium transition-colors" style={{ background: step === i ? 'var(--brand)' : 'var(--bg-card)', color: step === i ? 'white' : step > i ? 'var(--text-secondary)' : 'var(--text-muted)', borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none' }}>{i + 1}. {s}</button>
        ))}
      </div>
      {step === 0 && (<div className="card p-6 space-y-5"><div><label className="label">Campaign name *</label><input className="input" placeholder="e.g. August Newsletter" value={form.name} onChange={e => up({ name: e.target.value })} /></div><div><label className="label">Campaign type</label><select className="input" value={form.type} onChange={e => up({ type: e.target.value })}><option value="regular">Regular</option><option value="ab_test">A/B Test</option><option value="automated">Automated</option></select></div><div className="grid grid-cols-2 gap-4"><div><label className="label">From name</label><input className="input" placeholder="Your Brand" value={form.from_name} onChange={e => up({ from_name: e.target.value })} /></div><div><label className="label">From email</label><input className="input" type="email" placeholder="hello@yourdomain.com" value={form.from_email} onChange={e => up({ from_email: e.target.value })} /></div></div><div><label className="label">Reply-to email</label><input className="input" type="email" placeholder="reply@yourdomain.com" value={form.reply_to} onChange={e => up({ reply_to: e.target.value })} /></div></div>)}
      {step === 1 && (<div className="card p-6 space-y-5"><div className="p-4 rounded-lg border" style={{ background: 'rgba(85,98,245,0.05)', borderColor: 'rgba(85,98,245,0.2)' }}><div className="flex items-center gap-2 mb-3"><span>🤖</span><span className="font-medium text-sm">Generate with AI</span></div><div className="flex gap-2"><input className="input flex-1" placeholder="e.g. Promote our summer sale with 30% off" value={form.ai_prompt} onChange={e => up({ ai_prompt: e.target.value })} /><button className="btn btn-primary flex-shrink-0" onClick={generateWithAI} disabled={aiLoading}>{aiLoading ? '...' : '✨ Generate'}</button></div></div><div><label className="label">Subject line *</label><input className="input" placeholder="Your email subject line" value={form.subject} onChange={e => up({ subject: e.target.value })} /></div><div><label className="label">Preview text</label><input className="input" placeholder="Short preview..." value={form.preview_text} onChange={e => up({ preview_text: e.target.value })} /></div><div><label className="label">HTML content</label><textarea className="input font-mono" style={{ minHeight: 300, fontSize: 13 }} placeholder="<html>...</html>" value={form.html_content} onChange={e => up({ html_content: e.target.value })} /></div><div><label className="label">Plain text</label><textarea className="input" style={{ minHeight: 120 }} placeholder="Plain text version..." value={form.text_content} onChange={e => up({ text_content: e.target.value })} /></div></div>)}
      {step === 2 && (<div className="card p-6 space-y-5"><div><label className="label">Who receives this?</label><div className="space-y-3 mt-2"><label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border" style={{ borderColor: form.send_to_all ? 'var(--brand)' : 'var(--border)' }}><input type="radio" checked={form.send_to_all} onChange={() => up({ send_to_all: true })} /><div><div className="font-medium text-sm">All contacts</div></div></label><label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border" style={{ borderColor: !form.send_to_all ? 'var(--brand)' : 'var(--border)' }}><input type="radio" checked={!form.send_to_all} onChange={() => up({ send_to_all: false })} /><div><div className="font-medium text-sm">Lists</div></div></label></div></div><div><label className="label">Schedule</label><input type="datetime-local" className="input" value={form.send_at} onChange={e => up({ send_at: e.target.value })} /></div></div>)}
      {step === 3 && (<div className="card p-6 space-y-4"><h2 className="font-semibold text-lg">Review campaign</h2>{[{label:'Name',value:form.name||'—'},{label:'Subject',value:form.subject||'—'},{label:'From',value:`${form.from_name} <${form.from_email}>`},{label:'Recipients',value:form.send_to_all?'All':`${form.list_ids.length} lists`}].map(r =>(<div key={r.label} className="flex gap-4 py-3 border-b" style={{ borderColor:'var(--border)'}}><span className="text-sm w-32" style={{color:'var(--text-secondary)'}}>{r.label}</span><span className="text-sm font-medium">{r.value}</span></div>))}</div>)}
      <div className="flex justify-between mt-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="btn btn-secondary">
          {step === 0 ? 'Cancel' : '▐ Back'}
        </button>
        <div className="flex gap-3">
          {step === 3 ? (<><button className="btn btn-secondary" onClick={() => saveCampaign('draft')} disabled={saving}>Save Draft</button><button className="btn btn-primary" onClick={() => saveCampaign(form.send_at ? 'scheduled' : 'sending')} disabled={saving}>{saving ? 'Saving...' : form.send_at ? '📅 Schedule' : '🚀 Send Now'}</button></>) : (<button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue →</button>)}
        </div>
      </div>
    </div>
  );
}
