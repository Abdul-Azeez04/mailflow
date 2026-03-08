'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Brain, Send, Sparkles, Copy, RefreshCw, Zap, Mail, Target, TrendingUp, MessageSquare, ChevronDown, Star, Globe, Clock } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PROMPTS = [
  { label: '✉️ Write subject lines', prompt: 'Write 5 high-converting email subject lines for a SaaS product launch using urgency and curiosity.' },
  { label: '🔥 Re-engagement email', prompt: 'Write a compelling re-engagement email for subscribers who haven\'t opened in 90 days. Include a special offer hook.' },
  { label: '📊 Analyze my data', prompt: 'Based on a 24% open rate and 3.2% click rate, what optimizations should I make to improve my email performance?' },
  { label: '🎯 Welcome sequence', prompt: 'Create a 5-email welcome sequence for a B2B SaaS tool. Focus on onboarding, value delivery, and conversion.' },
  { label: '💡 A/B test ideas', prompt: 'Give me 10 creative A/B test ideas for email campaigns targeting e-commerce customers aged 25-40.' },
  { label: '🚀 Launch campaign', prompt: 'Write a complete product launch email campaign: announcement, early access, and final push emails.' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 I\'m your **MailFlow AI Assistant** — trained on thousands of high-performing email campaigns.\n\nI can help you:\n- ✍️ Write compelling email copy and subject lines\n- 📊 Analyze performance and suggest optimizations\n- 🎯 Build segmentation strategies\n- 🔄 Design automation sequences\n- 💡 Generate A/B testing ideas\n\nWhat would you like to create today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(content?: string) {
    const text = content || input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          system: `You are MailFlow AI, an expert email marketing assistant with deep knowledge of copywriting, deliverability, segmentation, and campaign optimization. You specialize in writing high-converting email campaigns, subject lines, and providing data-driven marketing advice. Be concise, actionable, and specific. Use markdown formatting for better readability.`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();
      const reply = data.content?.[0]?.text || 'I couldn\'t generate a response. Please try again.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      // Fallback demo response
      const demoResponses: Record<string, string> = {
        subject: '**High-Converting Subject Lines:**\n\n1. "You\'re leaving $X on the table 💰"\n2. "This expires in 24 hours (no pressure)"\n3. "The [competitor] secret nobody talks about"\n4. "Quick question about your [goal]"\n5. "[First name], we saved this just for you"',
      };
      const fallback = `I've analyzed your request. Here's my expert recommendation:\n\n**Email Marketing Best Practices:**\n\nFor "${text.slice(0, 50)}..."\n\n• **Personalization**: Use dynamic tokens for 26% higher open rates\n• **Send Timing**: Tuesday-Thursday, 9-11 AM in subscriber's timezone\n• **Subject Lines**: 6-10 words with curiosity or urgency hooks\n• **CTA**: Single, prominent call-to-action above the fold\n• **Mobile**: 60% of opens are mobile — design mobile-first\n\n*Note: Connect your Anthropic API key in Settings for full AI capabilities.*`;
      setMessages([...newMessages, { role: 'assistant', content: fallback }]);
    }
    setLoading(false);
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }

  function formatMessage(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '&bull; ')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI Marketing Assistant
          </h1>
          <p className="text-slate-400 mt-1">Powered by Claude · Expert email marketing intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 text-xs">Claude AI Active</span>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button key={p.label} onClick={() => sendMessage(p.prompt)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs hover:border-violet-500/50 hover:text-violet-300 transition-all">
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm ${msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={`group max-wb-[80%] relative ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-slate-800 border border-slate-700/50 text-slate-200' : 'bg-blue-600 text-white'}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              {msg.role === 'assistant' && (
                <button onClick={() => copyMessage(msg.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">🤖>/div>
            <div className="px-4 py-3 bg-slate-800 border border-slate-700/50 rounded-2xl">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex gap-3 bg-slate-800 border border-slate-700 rounded-2xl p-2 focus-within:border-violet-500/50 transition-all">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about email copy, campaigns, segmentation, deliverability..." rows={2}
            className="flex-1 bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none text-sm px-2 py-1" />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="self-end px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white hover:orocity-90 disabled:opacity-40 transition-all flex items-center gap-2 text-sm font-medium">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
