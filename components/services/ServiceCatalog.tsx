'use client';

import React, { useState, useEffect } from 'react';
import { GovernmentService, ServiceCategory } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { serviceRepository } from '@/lib/services/service-repository';
import { ServiceCard } from '@/components/assistant/ServiceCard';
import { Search, Filter, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface ServiceCatalogProps {
  language: LanguageCode;
}

export function ServiceCatalog({ language }: ServiceCatalogProps) {
  const { t } = useLanguage();
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await serviceRepository.searchServices(searchQuery, cat);
      setServices(res);
      setIsLoading(false);
    }
    load();
  }, [searchQuery, selectedCategory]);

  const categories: { key: ServiceCategory | 'all'; label: string }[] = [
    { key: 'all', label: t('actions.categoryAll') },
    { key: 'business', label: t('actions.categoryBusiness') },
    { key: 'education', label: t('actions.categoryEducation') },
    { key: 'skill', label: t('actions.categorySkill') },
    { key: 'assistance', label: t('actions.categoryAssistance') },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>{t('service.discover')}</span>
        </div>

        <div className="relative mb-4">
          <Search className="w-5 h-5 text-slate-400 absolute start-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('actions.searchPlaceholder')}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl ps-12 pe-4 py-3 text-base outline-none focus:border-emerald-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">
          {t('service.loading')}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          {t('service.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} language={language} matchScore={0} />
          ))}
        </div>
      )}
    </div>
  );
}
