'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, Grid, UserCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/assistant', label: t('nav.assistant'), icon: Mic },
    { href: '/services', label: t('nav.services'), icon: Grid },
    { href: '/progress', label: t('nav.progress'), icon: UserCheck },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 py-2 px-4 md:py-3"
      aria-label={t('nav.label')}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-extrabold bg-emerald-950/50 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
