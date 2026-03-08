import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MailFlow — AI Email Marketing Platform',
  description: 'Send smarter campaigns with AI. Compete with Mailchimp and HubSpot.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#16161e', color: '#f0f0fa', border: '1px solid #2a2a38', borderRadius: '10px', fontSize: '14px' } }} />
      </body>
    </html>
  );
}
