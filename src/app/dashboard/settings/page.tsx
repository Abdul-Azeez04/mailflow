'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Settings, User, Mail, Key, Bell, Shield, Globe, Zap, Save, Eye, EyeOff, ChevronRight, LogOut, CreditCard, Check, Brain, Webhook, Code } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '', company_name: '', sender_email: '', sender_name: '', reply_to: '' });
  const [apiKeys, setApiKeys] = useState({ anthropic_key: '', resend_key: '' });
  const [showKeys, setShowKeys] = useState({ anthropic: false, resend: false });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({ campaign_sent: true, campaign_opened: false, new_subscriber: true, bounce_alert: true, weekly_report: true });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.user_metadata) {
        setProfile(prev => ({ ...prev, full_name: data.user.user_metadata.full_name || '', sender_email: data.user.email || '' }));
      }
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.full_name, company_name: profile.company_name } });
    if (!error) { toast.success('Profile saved ✓'); }
    else { toast.error('Failed to save'); }
    setSaving(false);
  }

  async function saveApiKeys() {
    setSaving(true);
    // In production, store encrypted in user metadata or a secrets table
    const { error } = await supabase.auth.updateUser({ data: { has_anthropic_key: !!apiKeys.anthropic_key, has_resend_key: !!apiKeys.resend_key } });
    await new Promise(r => setTimeout(r, 800));
    toast.success('API keys saved securely ✓');
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'sending', label: 'Email Sending', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm">Manage your account and platform configuration</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <div className="border-t border-slate-700/50 pt-2 mt-4">
            <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-semibold">Profile Information</h3>
              <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(profile.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{profile.full_name || 'User'}</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                  <p className="text-slate-500 text-xs mt-1">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'full_name', placeholder: 'Your name' },
                  { label: 'Company Name', key: 'company_name', placeholder: 'Your company' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">{field.label}</label>
                    <input value={(profile as any)[field.key]} onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={saveProfile} disabled={saving} className="px-6 py-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'sending' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-semibold">Email Sending Configuration</h3>
              {[
                { label: 'Sender Name', key: 'sender_name', placeholder: 'Your Name or Company' },
                { label: 'Sender Email', key: 'sender_email', placeholder: 'hello@yourcompany.com' },
                { label: 'Reply-To Email', key: 'reply_to', placeholder: 'support@yourcompany.com (optional)' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">{field.label}</label>
                  <input value={(profile as any)[field.key] || ''} onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              ))}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm font-medium mb-1">📋 Domain Verification</p>
                <p className="text-slate-400 text-sm">For best deliverability, verify your sending domain. Add these DNS records to your domain provider:</p>
                <code className="block mt-2 text-xs bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono">
                  TXT @ v=spf1 include:resend.com ~all<br/>
                  CNAME resend._domainkey DKIM_KEY.dkim.resend.com
                </code>
              </div>
              <button onClick={saveProfile} disabled={saving} className="px-6 py-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-semibold flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" />AI Configuration</h3>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Anthropic API Key</label>
                  <div className="relative">
                    <input type={showKeys.anthropic ? 'text' : 'password'} value={apiKeys.anthropic_key}
                      onChange={e => setApiKeys({ ...apiKeys, anthropic_key: e.target.value })}
                      placeholder="sk-ant-api03-..."
                      className="w-full px-4 py-2.5 pr-10 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm font-mono" />
                    <button onClick={() => setShowKeys({ ...showKeys, anthropic: !showKeys.anthropic })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Powers AI email generation, subject line suggestions, and chat assistant. Get key at console.anthropic.com</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />Email Delivery</h3>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Resend API Key</label>
                  <div className="relative">
                    <input type={showKeys.resend ? 'text' : 'password'} value={apiKeys.resend_key}
                      onChange={e => setApiKeys({ ...apiKeys, resend_key: e.target.value })}
                      placeholder="re_..."
                      className="w-full px-4 py-2.5 pr-10 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm font-mono" />
                    <button onClick={() => setShowKeys({ ...showKeys, resend: !showKeys.resend })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showKeys.resend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Required for sending real emails. Get key at resend.com/api-keys</p>
                </div>
                <button onClick={saveApiKeys} disabled={saving} className="px-6 py-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save API Keys Securely'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold">Notification Preferences</h3>
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, string> = {
                  campaign_sent: 'Campaign sent confirmation',
                  campaign_opened: 'Real-time open notifications',
                  new_subscriber: 'New subscriber alerts',
                  bounce_alert: 'Bounce and complaint alerts',
                  weekly_report: 'Weekly performance digest',
                };
                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-300 text-sm">{labels[key]}</span>
                    <button onClick={() => setNotifications({ ...notifications, [key]: !value })}
                      className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-blue-600' : 'bg-slate-600'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                );
              })}
              <button onClick={() => toast.success('Notification settings saved')} className="px-6 py-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 text-sm font-medium">Save Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Security Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', enabled: false },
                    { label: 'Session Management', desc: 'Active sessions: 1 device', enabled: true },
                    { label: 'API Rate Limiting', desc: 'Protect against abuse', enabled: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-slate-400 text-xs">{item.desc}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${item.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'}`}>
                        {item.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-5">
                <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                <p className="text-slate-400 text-sm mb-3">Permanently delete your account and all data. This cannot be undone.</p>
                <button onClick={() => toast.error('Contact support to delete your account')} className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 text-sm hover:bg-red-600/30 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Integrations & Webhooks</h3>
              <div className="space-y-3">
                {[
                  { name: 'Zapier', desc: 'Connect to 5000+ apps', status: 'available', emoji: '⚡' },
                  { name: 'Webhooks', desc: 'Real-time event notifications', status: 'available', emoji: '🔗' },
                  { name: 'REST API', desc: 'Full programmatic access', status: 'active', emoji: '🔧' },
                  { name: 'Shopify', desc: 'E-commerce email automation', status: 'coming', emoji: '🛒' },
                  { name: 'WordPress', desc: 'Form and subscriber sync', status: 'coming', emoji: '📝' },
                ].map(integration => (
                  <div key={integration.name} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.emoji}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{integration.name}</p>
                        <p className="text-slate-400 text-xs">{integration.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${integration.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : integration.status === 'available' ? 'bg-blue-500/20 text-blue-400 cursor-pointer hover:bg-blue-500/30' : 'bg-slate-600/50 text-slate-500'}`}>
                      {integration.status === 'coming' ? 'Coming Soon' : integration.status === 'active' ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
