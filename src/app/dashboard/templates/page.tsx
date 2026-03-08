'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { FileText, Plus, Edit2, Trash2, Copy, Eye, Brain, Sparkles, Star, Clock, Search, Tag, Globe } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
  is_ai_generated?: boolean;
  preview_image?: string;
  created_at: string;
}

const CATEGORIES = ['All', 'Newsletter', 'Promotional', 'Transactional', 'Welcome', 'Re-engagement', 'Announcement'];

const STARTER_TEMPLATES = [
  { name: 'Modern Newsletter', category: 'Newsletter', subject: '{{month}} Insights: What We\'re Watching', emoji: '📰', color: 'from-blue-500 to-cyan-500' },
  { name: 'Flash Sale', category: 'Promotional', subject: '⚡ 24 Hours Only: {{discount}}% Off Everything', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Welcome Email', category: 'Welcome', subject: 'Welcome to {{company}} — Let\'s Get Started 🚀', emoji: '👋', color: 'from-emerald-500 to-teal-500' },
  { name: 'Product Update', category: 'Announcement', subject: 'New in {{product}}: {{feature}} is Here', emoji: '🚀', color: 'from-violet-500 to-purple-500' },
  { name: 'Win-Back', category: 'Re-engagement', subject: 'We miss you, {{first_name}} — Here\'s a gift', emoji: '💔', color: 'from-pink-500 to-rose-500' },
  { name: 'Order Confirmation', category: 'Transactional', subject: 'Order #{{order_id}} confirmed ✓', emoji: '✅', color: 'from-slate-500 to-slate-600' },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiGen, setShowAiGen] = useState(false);

  const [form, setForm] = useState({ name: '', subject: '', body: '', category: 'Newsletter' });

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('templates').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  }

  async function saveTemplate() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!form.name || !form.subject || !form.body) { toast.error('Fill all fields'); return; }

    if (editing) {
      const { error } = await supabase.from('templates').update(form).eq('id', editing.id);
      if (!error) { toast.success('Template updated'); }
    } else {
      const { error } = await supabase.from('templates').insert({ ...form, user_id: user.id });
      if (!error) { toast.success('Template saved'); }
    }
    setShowEditor(false);
    setEditing(null);
    setForm({ name: '', subject: '', body: '', category: 'Newsletter' });
    fetchTemplates();
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchTemplates(); }
  }

  async function duplicateTemplate(t: Template) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('templates').insert({ ...t, id: undefined, user_id: user.id, name: `${t.name} (copy)`, created_at: undefined });
    if (!error) { toast.success('Duplicated'); fetchTemplates(); }
  }

  async function generateWithAI() {
    if (!aiPrompt) return;
    setGenerating(true);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are an expert email copywriter. Generate a complete email template with a name, subject line, and HTML-ready body text. Format your response as JSON: {"name": "...", "subject": "...", "body": "..."}',
          messages: [{ role: 'user', content: `Create an email template for: ${aiPrompt}` }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setForm({ name: parsed.name || aiPrompt, subject: parsed.subject || '', body: parsed.body || '', category: 'Newsletter' });
      setShowAiGen(false);
      setShowEditor(true);
      toast.success('✨ AI template generated!');
    } catch {
      setForm({
        name: aiPrompt,
        subject: `Exciting news about ${aiPrompt}`,
        body: `Hi {{first_name}},\n\nWe have something amazing to share with you about ${aiPrompt}.\n\n[Your content here]\n\nBest regards,\n{{company_name}}`,
        category: 'Newsletter'
      });
      setShowAiGen(false);
      setShowEditor(true);
      toast.success('Template created (add AI key for full generation)');
    }
    setGenerating(false);
  }

  const filtered = templates.filter(t =>
    (category === 'All' || t.category === category) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Template Studio
          </h1>
          <p className="text-slate-400 mt-1">AI-powered email templates · {templates.length} saved</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAiGen(!showAiGen)} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-600/30 transition-all text-sm">
            <Brain className="w-4 h-4" />
            AI Generate
          </button>
          <button onClick={() => { setShowEditor(true); setEditing(null); setForm({ name: '', subject: '', body: '', category: 'Newsletter' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 rounded-xl text-white hover:bg-pink-700 transition-all text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* AI Generator */}
      {showAiGen && (
        <div className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" />AI Template Generator</h3>
          <div className="flex gap-3">
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe the email you want... e.g. 'Black Friday sale for fashion brand'"
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm" />
            <button onClick={generateWithAI} disabled={generating || !aiPrompt}
              className="px-6 py-2.5 bg-purple-600 rounded-xl text-white hover:bg-purple-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">{editing ? 'Edit Template' : 'New Template'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Template name"
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-slate-300 focus:outline-none focus:border-pink-500 text-sm">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject line — use {{first_name}}, {{company}} tokens"
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm" />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={8} placeholder="Email body content..."
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm resize-none font-mono" />
          <div className="flex gap-3">
            <button onClick={saveTemplate} className="px-6 py-2.5 bg-pink-600 rounded-xl text-white hover:bg-pink-700 text-sm font-medium">Save Template</button>
            <button onClick={() => { setShowEditor(false); setEditing(null); }} className="px-6 py-2.5 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 text-sm" />
        </div>
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 text-xs font-medium transition-all ${category === c ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 && templates.length === 0 ? (
        <div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center mb-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No templates yet</p>
            <p className="text-slate-400 text-sm mt-1">Start from a template or create your own</p>
          </div>
          <h3 className="text-white font-semibold mb-3">Starter Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map(t => (
              <button key={t.name} onClick={() => { setForm({ name: t.name, subject: t.subject, body: `Hi {{first_name}},\n\n[Your ${t.category.toLowerCase()} content here]\n\nBest,\n{{company_name}}`, category: t.category }); setShowEditor(true); }}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-slate-600 text-left transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-lg mb-3`}>{t.emoji}</div>
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-slate-400 text-xs mt-1">{t.category}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(t); setForm({ name: t.name, subject: t.subject, body: t.body, category: t.category || 'Newsletter' }); setShowEditor(true); }}
                    className="p-1.5 bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => duplicateTemplate(t)} className="p-1.5 bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Copy className="w-3 h-3" /></button>
                  <button onClick={() => deleteTemplate(t.id)} className="p-1.5 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <h3 className="text-white font-medium text-sm">{t.name}</h3>
              <p className="text-slate-400 text-xs mt-1 line-clamp-1">{t.subject}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 bg-slate-700 rounded-lg text-slate-400 text-xs">{t.category || 'General'}</span>
                {t.is_ai_generated && <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />AI</span>}
              </div>
              <p className="text-slate-600 text-xs mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
