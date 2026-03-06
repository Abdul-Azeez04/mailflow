# MailFlow — AI-Powered Email Automation

A full-stack email automation platform with AI-generated copy, behavioral tracking, BullMQ queues, and real-time analytics.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript |
| Backend API | Supabase Edge Functions (Deno) |
| AI Engine | Claude (Anthropic) |
| Email Delivery | Resend |
| Queue | BullMQ + Redis |
| Database | Supabase PostgreSQL |
| Analytics | Supabase + Recharts |

## Features

- **Dashboard** — live event feed, engagement charts, campaign overview
- **Campaigns** — create, preview, and send one-off campaigns with personalisation (`{{name}}`, `{{email}}`)
- **Contacts** — manage subscribers with tags, engagement scoring, and filtering
- **Sequences** — multi-step drip automation with configurable delays and triggers
- **AI Writer** — Claude-powered email generation with tone selection and template shortcuts
- **Queue Monitor** — BullMQ job inspection with retry status and payload preview

## Setup

```bash
npm install
cp .env.example .env.local
# fill in your keys
npm run dev
```

## Supabase Edge Function

The backend lives in `supabase/functions/email-automation/index.ts` and is deployed separately:

```bash
supabase functions deploy email-automation
```

Set secrets in Supabase Dashboard → Project Settings → Edge Functions:
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`

## BullMQ Worker

```bash
# Start the background worker (requires Redis)
npm run worker
```

See `src/worker/index.ts` for the job processor.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/mailflow)
