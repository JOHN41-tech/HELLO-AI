'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { LanguageCode } from '@/types/language';
import { useLanguage } from '@/hooks/useLanguage';

export interface VoicePlaybackButtonProps {
  text: string;
  language: LanguageCode;
  messageId?: string;
}

export function VoicePlaybackButton({ text, language, messageId = 'voice-message' }: VoicePlaybackButtonProps) {
  const { t } = useLanguage();
  const {
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    voiceState,
    activeVoiceOwnerId,
    errorMessage,
    isTTSSupported,
  } = useVoice(language, messageId);
  const [hasPlayed, setHasPlayed] = useState(false);
  const ownsPlayback = activeVoiceOwnerId === messageId;
  const isPlaying = ownsPlayback && voiceState === 'speaking';
  const isPaused = ownsPlayback && voiceState === 'paused';
  const messageExcerpt = text.replace(/\s+/g, ' ').trim().slice(0, 80);

  const play = () => {
    setHasPlayed(true);
    speak(text, undefined, messageId);
  };
  const togglePlayback = () => {
    if (isPlaying) pauseSpeaking();
    else if (isPaused) resumeSpeaking();
    else play();
  };
  const primaryLabel = isPlaying
    ? t('assistant.pauseAudio')
    : isPaused
      ? t('assistant.resumeAudio')
      : t('assistant.replay');

  if (!isTTSSupported) {
    return <span className="max-w-64 text-xs text-slate-500" role="status">{t('errors.speechUnavailable')}</span>;
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={togglePlayback}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          isPlaying || isPaused
            ? 'border-amber-500/30 bg-amber-950/60 text-amber-300'
            : 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
        aria-pressed={isPlaying || isPaused}
        aria-label={`${primaryLabel}: ${messageExcerpt}`}
        title={`${primaryLabel}: ${messageExcerpt}`}
      >
        {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : isPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />}
        <span>{primaryLabel}</span>
      </button>
      {hasPlayed && (
        <>
          <button
            type="button"
            onClick={play}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={t('assistant.replay')}
            title={t('assistant.replay')}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={t('assistant.stopAudio')}
              title={t('assistant.stopAudio')}
            >
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </>
      )}
      {errorMessage && <span className="max-w-40 text-xs text-red-400" role="status">{errorMessage}</span>}
    </div>
  );
}
