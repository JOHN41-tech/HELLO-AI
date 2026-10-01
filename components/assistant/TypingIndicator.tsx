import React from 'react';
import { Bot } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function TypingIndicator() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3 my-2" role="status">
      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-md">
        <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
        <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
        <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
        <span className="text-xs font-medium text-slate-400 ms-2">{t('conversation.thinking')}</span>
      </div>
    </div>
  );
}
