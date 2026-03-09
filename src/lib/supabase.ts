import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Campaign = {
  id: string
  user_id: string
  name: string
  subject: string
  preview_text: string
  from_name: string
  from_email: string
  reply_to: string
  content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  contact_list_id: string | null
  scheduled_at: string | null
  sent_at: string | null
  total_recipients: number
  opens: number
  clicks: number
  unsubscribes: number
  bounces: number
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  tags: string[]
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'cleaned'
  contact_list_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type ContactList = {
  id: string
  user_id: string
  name: string
  description: string | null
  contact_count: number
  created_at: string
  updated_at: string
}

export type Template = {
  id: string
  user_id: string
  name: string
  category: string
  subject: string
  content: string
  preview_image: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Automation = {
  id: string
  user_id: string
  name: string
  trigger_type: string
  trigger_config: Record<string, any>
  status: 'active' | 'paused' | 'draft'
  steps: AutomationStep[]
  enrolled_count: number
  completed_count: number
  created_at: string
  updated_at: string
}

export type AutomationStep = {
  id: string
  type: 'email' | 'wait' | 'condition' | 'tag'
  config: Record<string, any>
  order: number
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  website: string | null
  plan: 'free' | 'pro' | 'enterprise'
  monthly_email_limit: number
  emails_sent_this_month: number
  resend_api_key: string | null
  from_domain: string | null
  created_at: string
  updated_at: string
}
