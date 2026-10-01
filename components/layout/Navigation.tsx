'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, Grid2X2, UserRound } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('nav.home'), mobileLabel: undefined, icon: Home },
    { href: '/assistant', label: t('nav.assistant'), mobileLabel: undefined, icon: Mic },
    { href: '/services', label: t('nav.services'), mobileLabel: t('nav.servicesShort'), icon: Grid2X2 },
    { href: '/progress', label: t('nav.progress'), mobileLabel: undefined, icon: UserRound },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 px-2 pt-2"
      style={{ paddingBottom: 'max(.5rem, env(safe-area-inset-bottom))' }}
      aria-label={t('nav.label')}
    >
      <div className="mx-auto flex max-w-xl items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition-colors sm:min-h-14 sm:flex-row sm:gap-2 sm:px-3 ${
                isActive
                  ? 'bg-emerald-950 text-emerald-400 font-bold'
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.mobileLabel ? (
                <>
                  <span className="max-w-full truncate text-[10px] leading-tight sm:hidden">{item.mobileLabel}</span>
                  <span className="hidden max-w-full truncate text-xs sm:inline">{item.label}</span>
                </>
              ) : (
                <span className="max-w-full truncate text-[10px] leading-tight sm:text-xs">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
