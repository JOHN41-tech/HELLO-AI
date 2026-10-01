'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/conversation';
import { LanguageCode } from '@/types/language';
import { Bot, User, Mic } from 'lucide-react';
import { VoicePlaybackButton } from './VoicePlaybackButton';
import { QuestionCard } from './QuestionCard';
import { ServiceCard } from './ServiceCard';
import { EligibilityCard } from './EligibilityCard';
import { DocumentCard } from './DocumentCard';
import { ApplicationStepCard } from './ApplicationStepCard';
import { useLanguage } from '@/hooks/useLanguage';

export interface ChatMessageProps {
  message: ChatMessageType;
  language: LanguageCode;
  onAnswerQuestion?: (fieldKey: string, value: string | number | boolean) => void;
}

export function ChatMessage({ message, language, onAnswerQuestion }: ChatMessageProps) {
  const { t } = useLanguage();
  const isUser = message.role === 'user';
  const isVoice = message.type === 'voice';

  return (
    <div className={`flex items-start gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Role Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-indigo-600 text-white border border-indigo-400'
            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={`flex flex-col max-w-[90%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Main Bubble with logical direction and RTL support */}
        <div
          className={`chat-bubble ${
            isUser
              ? 'chat-bubble-user bg-indigo-600 text-white'
              : 'chat-bubble-bot bg-slate-900 border border-slate-800 text-slate-100'
          }`}
        >
          {isVoice && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-200 font-semibold mb-1">
              <Mic className="w-3.5 h-3.5" />
              <span>{t('assistant.voiceQuery')}</span>
            </div>
          )}

          <p className="whitespace-pre-wrap text-start">{message.content}</p>

          {!isUser && message.content && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-xs">
              <VoicePlaybackButton text={message.content} language={language} />
              <span className="text-[10px] text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Guided Question Card if present */}
        {message.metadata?.question && onAnswerQuestion && (
          <div className="w-full mt-2">
            <QuestionCard
              question={message.metadata.question}
              language={language}
              onAnswer={onAnswerQuestion}
            />
          </div>
        )}

        {/* Matched Service Card */}
        {message.metadata?.service && (
          <div className="w-full mt-2">
            <ServiceCard
              service={message.metadata.service}
              language={language}
              matchScore={message.metadata.eligibilityResult?.score}
            />

            {message.metadata.eligibilityResult && (
              <EligibilityCard
                result={message.metadata.eligibilityResult}
                language={language}
              />
            )}

            {message.metadata.service.requiredDocuments && (
              <DocumentCard
                documents={message.metadata.service.requiredDocuments}
                language={language}
              />
            )}

            {message.metadata.service.applicationSteps && (
              <ApplicationStepCard
                steps={message.metadata.service.applicationSteps}
                language={language}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
