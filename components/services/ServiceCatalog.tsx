'use client';

import React, { useState, useEffect } from 'react';
import { GovernmentService, ServiceCategory } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { serviceRepository } from '@/lib/services/service-repository';
import { ServiceCard } from '@/components/assistant/ServiceCard';
import { GuideMePanel } from '@/components/assistant/GuideMePanel';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface ServiceCatalogProps {
  language: LanguageCode;
}

export function ServiceCatalog({ language }: ServiceCatalogProps) {
  const { t, currentConfig } = useLanguage();
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [guidingServiceId, setGuidingServiceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const results = await serviceRepository.searchServices(searchQuery, category);
      if (!cancelled) {
        setServices(results);
        setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [searchQuery, selectedCategory]);

  const categories: { key: ServiceCategory | 'all'; label: string }[] = [
    { key: 'all', label: t('actions.categoryAll') },
    { key: 'business', label: t('actions.categoryBusiness') },
    { key: 'education', label: t('actions.categoryEducation') },
    { key: 'skill', label: t('actions.categorySkill') },
    { key: 'assistance', label: t('actions.categoryAssistance') },
  ];
  const guidedService = services.find((service) => service.id === guidingServiceId);

  return (
    <div className="space-y-5">
      <header className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">{t('app.navigatorLabel')}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-100 sm:text-3xl">{t('service.discover')}</h1>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:p-5" aria-label={t('service.discover')}>
        <div className="relative">
          <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label className="sr-only" htmlFor="service-search">{t('actions.searchPlaceholder')}</label>
          <input
            id="service-search"
            type="search"
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setGuidingServiceId(null); }}
            placeholder={t('actions.searchPlaceholder')}
            dir={currentConfig.direction}
            lang={currentConfig.code}
            className="min-h-12 w-full rounded-xl border border-slate-800 bg-slate-950 py-3 ps-12 pe-4 text-base text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <Filter className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label={t('actions.categoryAll')}>
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => { setSelectedCategory(category.key); setGuidingServiceId(null); }}
                aria-pressed={selectedCategory === category.key}
                className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  selectedCategory === category.key
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-500 hover:bg-slate-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {services.some((service) => service.source.verificationStatus !== 'verified') && (
        <div role="note" className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950 px-4 py-3 text-sm leading-relaxed text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>{t('service.sampleNotice')}</span>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-10 text-center text-sm text-slate-500" role="status" aria-live="polite">
          {t('service.loading')}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-10 text-center text-sm leading-relaxed text-slate-500" role="status">
          {t('service.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              language={language}
              onGuide={() => setGuidingServiceId(service.id)}
            />
          ))}
        </div>
      )}

      {guidedService?.source.verificationStatus === 'verified' && (
        <GuideMePanel
          service={guidedService}
          language={language}
          onExit={() => setGuidingServiceId(null)}
        />
      )}
    </div>
  );
}
