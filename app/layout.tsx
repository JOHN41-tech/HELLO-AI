import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

/* eslint @next/next/no-page-custom-font: off -- This is the shared App Router root layout, so the font fallback is global, not page-specific. */

export const metadata: Metadata = {
  title: 'HELLO AI — Your Voice. Your Rights. Your AI Guide.',
  description:
    'A voice-first AI navigator helping people find government-service information in 12 Indian languages.',
  keywords: ['HELLO AI', 'Government Schemes', 'Women Empowerment', 'Voice AI', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;700;800&family=Noto+Sans+Devanagari:wght@400;500;700;800&family=Noto+Sans+Telugu:wght@400;500;700;800&family=Noto+Sans+Kannada:wght@400;500;700;800&family=Noto+Sans+Malayalam:wght@400;500;700;800&family=Noto+Sans+Gujarati:wght@400;500;700;800&family=Noto+Sans+Bengali:wght@400;500;700;800&family=Noto+Sans+Gurmukhi:wght@400;500;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <LanguageProvider>
          <div id="app-shell" className="flex min-h-screen flex-col">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
