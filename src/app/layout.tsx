import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
export const metadata = { title: 'MailFlow -- AI Email Marketing', description: 'Send smarter campaigns with AI' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={inter.variable}><body>{[🔑Sjlplogading}{children}<Toaster position="bottom-right" toastOptions={{style:{background:'#16161e',color:'#f0f0fa',border:'1px solid #2a2a38',}}}/></body></html>);}
