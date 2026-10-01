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
import { Send, RotateCcw, PlayCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';
import { useVoice } from '@/hooks/useVoice';
import { useConversation } from '@/hooks/useConversation';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');

  const { language, currentConfig, setLanguage, t } = useLanguage();
  const { session, updateAnswer, clearSession } = useSession(language);
  const { voiceState, transcript, errorMessage, startListening, stopListening } = useVoice(language);
  const { messages, isTyping, error, sendMessage, answerQuestion, resetConversation } = useConversation(
    session,
    language
  );

  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (initialQuery && messages.length === 0 && !didInit.current) {
      didInit.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, messages.length, sendMessage]);

  useEffect(() => {
    if (transcript && voiceState === 'processing') {
      sendMessage(transcript, true);
    }
  }, [transcript, voiceState, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const runDemoFlow = () => {
    resetConversation();
    clearSession();
    setTimeout(() => sendMessage(t('actions.categoryBusiness')), 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col">
        {/* Demo Banner */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('app.phaseBadge')} — {currentConfig.nativeName}</span>
          </div>
          <button
            onClick={runDemoFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
            aria-label={t('assistant.runDemo')}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{t('assistant.runDemo')}</span>
          </button>
        </div>

        {/* Conversation error */}
        {error && (
          <ErrorMessage message={error || t('errors.generic')} onRetry={resetConversation} />
        )}

        {/* Voice error notice */}
        {errorMessage && (
          <ErrorMessage message={errorMessage || t('errors.voiceUnavailable')} />
        )}

        {/* Conversation */}
        <div className="flex-1 space-y-3 pb-48">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{t('welcome.title')}</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">{t('welcome.subtitle')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                language={language}
                onAnswerQuestion={async (key, val) => {
                  await updateAnswer(key, val);
                  answerQuestion(key, val, (k, v) => updateAnswer(k, v));
                }}
              />
            ))
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Dock */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <VoiceButton
            voiceState={voiceState}
            onStartListening={() => startListening()}
            onStopListening={() => stopListening()}
            size="lg"
          />
          <form onSubmit={handleSendText} className="w-full flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              aria-label={t('assistant.placeholder')}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-base outline-none focus:border-emerald-400 min-h-[48px]"
              dir={currentConfig.direction}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!textInput.trim()}
              aria-label={t('assistant.send')}
              title={t('assistant.send')}
            >
              <Send className="w-5 h-5 rtl:rotate-180" />
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={resetConversation}
                title={t('assistant.reset')}
                aria-label={t('assistant.reset')}
              >
                <RotateCcw className="w-5 h-5 text-slate-400" />
              </Button>
            )}
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AssistantContent />
    </React.Suspense>
  );
}
