'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { ServiceCatalog } from '@/components/services/ServiceCatalog';
import { useLanguage } from '@/hooks/useLanguage';

export default function ServicesPage() {
  const { language, currentConfig, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <ServiceCatalog language={language} />
      </main>

      <Navigation />
    </div>
  );
}
