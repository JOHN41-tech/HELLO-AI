import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'HELLO AI — Your Voice. Your Rights. Your AI Guide.',
  description:
    'A voice-first AI navigator for first-time users to access government schemes in 12 Indian languages.',
  keywords: ['HELLO AI', 'Government Schemes', 'Women Empowerment', 'Voice AI', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Noto Sans covers all Indic scripts in one family */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Noto+Sans+Tamil:wght@400;700;900&family=Noto+Sans+Devanagari:wght@400;700;900&family=Noto+Sans+Telugu:wght@400;700;900&family=Noto+Sans+Kannada:wght@400;700;900&family=Noto+Sans+Malayalam:wght@400;700;900&family=Noto+Sans+Gujarati:wght@400;700;900&family=Noto+Sans+Bengali:wght@400;700;900&family=Noto+Sans+Gurmukhi:wght@400;700;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 antialiased">
        <LanguageProvider>
          <main className="flex-1 pb-24">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
