'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Zap, Plus, Play, Pause, Trash2, Clock, Mail, Users, ArrowRight, Brain, GitBranch, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  status: string;
  sequence: any[];
  enrolled_count?: number;
  completed_count?: number;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  signup: '🆕 New Subscriber',
  tag_added: '🏷️ Tag Added',
  campaign_opened: '📬 Email Opened',
  link_clicked: '🔗 Link Clicked',
  date_based: '📅 Date / Anniversary',
  purchase: '💳 Purchase Made',
};

const AUTOMATION_TEMPLATES = [
  { name: 'Welcome Series', trigger: 'signup', description: '5-email onboarding sequence', steps: 5, icon: '👋', color: 'from-blue-500 to-cyan-500' },
  { name: 'Win-Back Campaign', trigger: 'date_based', description: 'Re-engage dormant subscribers', steps: 3, icon: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Purchase Follow-up', trigger: 'purchase', description: 'Post-purchase nurture flow', steps: 4, icon: '💰', color: 'from-emerald-500 to-teal-500' },
  { name: 'Engagement Booster', trigger: 'campaign_opened', description: 'Deepen engagement with openers', steps: 3, icon: '⚡', color: 'from-violet-500 to-purple-500' },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('signup');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAutomations(); }, []);

  async function fetchAutomations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('automations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAutomations(data || []);
    setLoading(false);
  }

  async function createAutomation(template?: typeof AUTOMATION_TEMPLATES[0]) {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const name = template?.name || newName;
    const trigger = template?.trigger || newTrigger;

    if (!name) { toast.error('Enter a name'); setCreating(false); return; }

    const defaultSequence = Array.from({ length: template?.steps || 3 }, (_, i) => ({
      step: i + 1,
      type: 'email',
      delay_days: i === 0 ? 0 : 2,
      subject: `${name} - Email ${i + 1}`,
      content: `Hi {{first_name}}, this is email ${i + 1} of your ${name} sequence.`,
    }));

    const { error } = await supabase.from('automations').insert({
      user_id: user.id,
      name,
      trigger_type: trigger,
      status: 'draft',
      sequence: defaultSequence,
      enrolled_count: 0,
      completed_count: 0,
    });

    if (error) { toast.error('Failed to create'); }
    else {
      toast.success(`✨ Automation "${name}" created`);
      setShowBuilder(false);
      setNewName('');
      fetchAutomations();
    }
    setCreating(false);
  }

  async function toggleStatus(automation: Automation) {
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('automations').update({ status: newStatus }).eq('id', automation.id);
    if (!error) {
      toast.success(`Automation ${newStatus}`);
      fetchAutomations();
    }
  }

  async function deleteAutomation(id: string) {
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchAutomations(); }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-slate-600/50 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Automation Engine
          </h1>
          <p className="text-slate-400 mt-1">AI-powered workflows that run 24/7</p>
        </div>
        <button onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-all text-sm font-medium">
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Active Flows</p>
          <p className="text-2xl font-bold text-emerald-400">{automations.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total Enrolled</p>
          <p className="text-2xl font-bold text-blue-400">{automations.reduce((a, c) => a + (c.enrolled_count || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Completed</p>
          <p className="text-2xl font-bold text-purple-400">{automations.reduce((a, c) => a + (c.completed_count || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Builder */}
      {showBuilder && (
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-orange-400" />
            Quick-Start Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AUTOMATION_TEMPLATES.map(t => (
              <button key={t.name} onClick={() => createAutomation(t)}
                className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:border-orange-500/50 hover:bg-slate-700 transition-all text-left group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-lg mb-3`}>{t.icon}</div>
                <p className="text-white text-sm font-medium group-hover:text-orange-300 transition-colors">{t.name}</p>
                <p className="text-slate-400 text-xs mt-1">{t.description}</p>
                <p className="text-slate-500 text-xs mt-1">{t.steps} steps</p>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-700/50 pt-4">
            <p className="text-slate-400 text-sm mb-3">Or create custom automation:</p>
            <div className="flex gap-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Automation name..."
                className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 text-sm" />
              <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
                className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-slate-300 focus:outline-none focus:border-orange-500 text-sm">
                {Object.entries(TRIGGER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button onClick={() => createAutomation()} disabled={creating}
                className="px-6 py-2.5 bg-orange-600 rounded-xl text-white hover:bg-orange-700 disabled:opacity-50 text-sm font-medium">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automations List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-16 text-center">
          <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No automations yet</p>
          <p className="text-slate-400 mt-2">Create your first workflow to automate subscriber journeys</p>
          <button onClick={() => setShowBuilder(true)} className="mt-4 px-6 py-2.5 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-all text-sm font-medium">
            Get Started
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map(automation => (
            <div key={automation.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-medium">{automation.name}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${statusColors[automation.status] || statusColors.draft}`}>
                        {automation.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-400 text-xs">{TRIGGER_LABELS[automation.trigger_type] || automation.trigger_type}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-xs">{automation.sequence?.length || 0} steps</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-xs">{automation.enrolled_count || 0} enrolled</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Flow preview */}
                  <div className="hidden md:flex items-center gap-1 mr-4">
                    {(automation.sequence || []).slice(0, 4).map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                          <Mail className="w-3 h-3 text-slate-400" />
                        </div>
                        {i < 3 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                      </div>
                    ))}
                    {(automation.sequence?.length || 0) > 4 && <span className="text-slate-500 text-xs">+{automation.sequence.length - 4}</span>}
                  </div>
                  <button onClick={() => toggleStatus(automation)} className={`p-2 rounded-xl border transition-all ${automation.status === 'active' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}>
                    {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteAutomation(automation.id)} className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
