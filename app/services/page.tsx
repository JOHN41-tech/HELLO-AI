'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { ServiceCatalog } from '@/components/services/ServiceCatalog';
import { useLanguage } from '@/hooks/useLanguage';

export default function ServicesPage() {
  const { language, currentConfig, setLanguage } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <ServiceCatalog language={language} />
      </main>
      <Navigation />
    </div>
  );
}
