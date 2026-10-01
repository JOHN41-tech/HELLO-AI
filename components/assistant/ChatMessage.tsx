'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/conversation';
import { LanguageCode } from '@/types/language';
import { Bot, User, Mic } from 'lucide-react';
import { VoicePlaybackButton } from './VoicePlaybackButton';
import { QuestionCard } from './QuestionCard';
import { ServiceCard } from './ServiceCard';
import { EligibilityCard } from './EligibilityCard';
import { DocumentCard } from './DocumentCard';
import { GuideMePanel } from './GuideMePanel';
import { useLanguage } from '@/hooks/useLanguage';
import { getLanguageConfig } from '@/lib/i18n/languages';

export interface ChatMessageProps {
  message: ChatMessageType;
  language: LanguageCode;
  onAnswerQuestion?: (fieldKey: string, value: string | number | boolean) => void;
  onTryAnotherQuestion?: (text: string) => void;
}

export function ChatMessage({ message, language, onAnswerQuestion, onTryAnotherQuestion }: ChatMessageProps) {
  const { t } = useLanguage();
  const [isGuiding, setIsGuiding] = useState(false);
  const isUser = message.role === 'user';
  const isVoice = message.type === 'voice';
  const messageLanguage = getLanguageConfig(message.language);
  const canSpeak = !isUser && Boolean(message.content) && message.metadata?.shouldSpeak !== false;
  const isNoMatch = !isUser && message.content.trim() === t('service.noMatch');
  const time = new Intl.DateTimeFormat(messageLanguage.locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp));
  const retryTopics = [
    'actions.categoryBusiness',
    'actions.categoryAssistance',
    'actions.categorySkill',
    'actions.categoryEducation',
  ];

  return (
    <article
      className={`my-4 flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      lang={messageLanguage.code}
      dir={messageLanguage.direction}
      aria-label={isUser ? t('common.you') : t('appName')}
    >
      <div
        className={`mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          isUser ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-emerald-500/30 bg-emerald-950 text-emerald-400'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`mb-1 px-1 text-xs font-semibold ${isUser ? 'text-slate-500' : 'text-emerald-400'}`}>
          {isUser ? t('common.you') : t('appName')}
        </div>
        <div
          className={`chat-bubble w-fit max-w-full ${
            isUser
              ? 'chat-bubble-user bg-indigo-600 text-white'
              : 'chat-bubble-bot border border-slate-800 bg-slate-900 text-slate-100'
          }`}
        >
          {isVoice && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white">
              <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('assistant.voiceQuery')}</span>
            </div>
          )}
          <p className="whitespace-pre-wrap text-start leading-relaxed">{message.content}</p>

          {!isUser && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2">
              {canSpeak ? <VoicePlaybackButton text={message.content} language={message.language} messageId={message.id} /> : <span />}
              <time className="text-[11px] text-slate-500" dateTime={message.timestamp}>{time}</time>
            </div>
          )}
        </div>

        {isNoMatch && onTryAnotherQuestion && (
          <div className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 p-4" role="group" aria-label={t('welcome.chooseNeed')}>
            <p className="mb-3 text-sm font-semibold text-slate-200">{t('welcome.chooseNeed')}</p>
            <div className="flex flex-wrap gap-2">
              {retryTopics.map((key) => {
                const label = t(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTryAnotherQuestion(label)}
                    className="min-h-11 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-start text-xs font-semibold text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-950 sm:text-sm"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {message.metadata?.question && onAnswerQuestion && (
          <div className="mt-2 w-full">
            <QuestionCard question={message.metadata.question} language={language} onAnswer={onAnswerQuestion} />
          </div>
        )}

        {message.metadata?.service && (
          <div className="mt-2 w-full">
            <ServiceCard
              service={message.metadata.service}
              language={language}
              onGuide={() => setIsGuiding(true)}
            />
            {message.metadata.eligibilityResult && message.metadata.service.source.verificationStatus === 'verified' && (
              <EligibilityCard result={message.metadata.eligibilityResult} language={language} />
            )}
            {message.metadata.service.source.verificationStatus === 'verified' && message.metadata.service.requiredDocuments.length > 0 && (
              <DocumentCard documents={message.metadata.service.requiredDocuments} language={language} />
            )}
            {isGuiding && message.metadata.service.source.verificationStatus === 'verified' ? (
              <div>
                <GuideMePanel
                  service={message.metadata.service}
                  language={language}
                  eligibilityResult={message.metadata.eligibilityResult}
                  onExit={() => setIsGuiding(false)}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
