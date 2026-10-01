'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { ChatMessage } from '@/components/assistant/ChatMessage';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ArrowUp, BriefcaseBusiness, HeartHandshake, Award, BookOpen, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';
import { useVoice } from '@/hooks/useVoice';
import { useConversation } from '@/hooks/useConversation';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const { language, currentConfig, setLanguage, t } = useLanguage();
  const { session, isLoading, updateAnswer } = useSession(language);
  const { voiceState, transcript, errorMessage, startListening, stopListening, speak } = useVoice(language);
  const {
    messages,
    isTyping,
    error,
    sendMessage,
    answerQuestion,
    retryLastRequest,
    resetConversation,
  } = useConversation(session, language);

  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const didInit = useRef(false);
  const lastAutoSpokenMessageId = useRef<string | null>(null);

  useEffect(() => {
    if (initialQuery && messages.length === 0 && !didInit.current && !isLoading) {
      didInit.current = true;
      void sendMessage(initialQuery);
    }
  }, [initialQuery, isLoading, messages.length, sendMessage]);

  useEffect(() => {
    if (messages.length < 2) return;
    const latest = messages[messages.length - 1];
    const previousUserMessage = [...messages.slice(0, -1)].reverse().find((message) => message.role === 'user');
    if (
      latest.role === 'assistant' &&
      previousUserMessage?.type === 'voice' &&
      latest.metadata?.shouldSpeak !== false &&
      lastAutoSpokenMessageId.current !== latest.id
    ) {
      lastAutoSpokenMessageId.current = latest.id;
      speak(latest.content, undefined, latest.id);
    }
  }, [messages, speak]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const submitText = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isTyping) return;
    void sendMessage(cleanText);
    setTextInput('');
    if (textAreaRef.current) textAreaRef.current.style.height = '3rem';
  };

  const handleSendText = (event: React.FormEvent) => {
    event.preventDefault();
    submitText(textInput);
  };

  const quickPrompts = [
    { icon: BriefcaseBusiness, key: 'actions.categoryBusiness' },
    { icon: HeartHandshake, key: 'actions.categoryAssistance' },
    { icon: Award, key: 'actions.categorySkill' },
    { icon: BookOpen, key: 'actions.categoryEducation' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-80 pt-5 sm:px-6 sm:pb-64">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
              {t('app.navigatorLabel')}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-100 sm:text-3xl">
              {t('welcome.title')}
            </h1>
            {messages.length === 0 && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                {t('welcome.subtitle')}
              </p>
            )}
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              aria-label={t('assistant.reset')}
              title={t('assistant.reset')}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('assistant.reset')}</span>
            </Button>
          )}
        </div>

        {error && <ErrorMessage message={error} onRetry={() => void retryLastRequest()} />}
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <section
          className="flex-1"
          aria-label={t('nav.assistant')}
          aria-live="off"
        >
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center py-5 text-center sm:py-9">
              <p className="mt-0 max-w-lg text-sm leading-relaxed text-slate-500">
                {t('welcome.privacyNote')}
              </p>
              <div className="mt-6 w-full max-w-2xl">
                <p className="mb-3 text-xs font-semibold text-slate-500">{t('welcome.chooseNeed')}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {quickPrompts.map(({ icon: Icon, key }) => {
                    const label = t(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => void sendMessage(label)}
                        disabled={isTyping || isLoading}
                        className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-start text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-950 hover:text-slate-100 disabled:opacity-60"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span className="leading-snug">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="space-y-4 pb-3"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label={t('nav.assistant')}
            >
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  language={language}
                  onAnswerQuestion={(key, value) => {
                    void answerQuestion(key, value, (field, answer) => { void updateAnswer(field, answer); });
                  }}
                  onTryAnotherQuestion={(text) => void sendMessage(text)}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} className="scroll-mb-[20rem]" />
            </div>
          )}
        </section>
      </main>

      <div
        className="fixed inset-x-0 z-40 border-t border-slate-800 bg-slate-950/95 px-3 py-3 sm:px-5"
        style={{ bottom: 'calc(4.15rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2.5">
          <VoiceButton
            voiceState={voiceState}
            disabled={isTyping || isLoading}
            busyLabel={isTyping ? t('conversation.thinking') : undefined}
            onStartListening={() => startListening((completeTranscript) => sendMessage(completeTranscript, true))}
            onStopListening={stopListening}
            size={messages.length === 0 ? 'lg' : 'md'}
          />

          {voiceState === 'listening' && transcript && (
            <p className="w-full max-w-3xl rounded-xl border border-emerald-500/30 bg-emerald-950 px-3 py-2 text-start text-sm text-slate-200" role="status" aria-live="polite">
              {transcript}
            </p>
          )}

          <form onSubmit={handleSendText} className="flex w-full items-end gap-2" aria-label={t('assistant.placeholder')}>
            <label className="sr-only" htmlFor="chat-input">{t('assistant.placeholder')}</label>
            <textarea
              id="chat-input"
              ref={textAreaRef}
              rows={1}
              value={textInput}
              onChange={(event) => {
                setTextInput(event.target.value);
                event.currentTarget.style.height = '3rem';
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 144)}px`;
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submitText(textInput);
                }
              }}
              placeholder={t('assistant.placeholder')}
              dir={currentConfig.direction}
              lang={currentConfig.code}
              maxLength={4000}
              className="min-h-12 max-h-36 min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-base leading-6 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              aria-label={t('assistant.placeholder')}
              disabled={isTyping || isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!textInput.trim() || isTyping || isLoading}
              className="w-12 shrink-0 px-0"
              aria-label={t('assistant.send')}
              title={t('assistant.send')}
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-500" role="status">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <AssistantContent />
    </React.Suspense>
  );
}
