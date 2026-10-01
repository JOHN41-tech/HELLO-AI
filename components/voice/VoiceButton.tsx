'use client';

import React from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { VoiceState } from '@/types/voice';
import { useLanguage } from '@/hooks/useLanguage';

export interface VoiceButtonProps {
  voiceState: VoiceState;
  onStartListening: () => void;
  onStopListening: () => void;
  size?: 'md' | 'lg' | 'hero';
  disabled?: boolean;
  busyLabel?: string;
}

export function VoiceButton({
  voiceState,
  onStartListening,
  onStopListening,
  size = 'hero',
  disabled = false,
  busyLabel,
}: VoiceButtonProps) {
  const { t } = useLanguage();
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isSpeaking = voiceState === 'speaking' || voiceState === 'paused';
  const isUnsupported = voiceState === 'unsupported';
  const isPaused = voiceState === 'paused';
  const isBusy = isProcessing || isSpeaking;

  const handleClick = () => {
    if (isListening) onStopListening();
    else if (!isBusy && !disabled && !isUnsupported) onStartListening();
  };

  const getLabel = () => {
    if (isListening) return t('conversation.listening');
    if (isProcessing) return t('conversation.processing');
    if (voiceState === 'speaking') return t('assistant.speak');
    if (isPaused) return t('assistant.resumeAudio');
    if (isUnsupported) return t('errors.voiceUnavailable');
    if (voiceState === 'error') return t('errors.generic');
    if (disabled) return busyLabel || t('conversation.thinking');
    return t('assistant.listen');
  };

  const sizeClasses = {
    md: 'h-14 w-14 text-xl',
    lg: 'h-20 w-20 text-3xl',
    hero: 'h-28 w-28 text-4xl sm:h-32 sm:w-32 sm:text-5xl',
  };
  const isDisabled = disabled || isBusy || isUnsupported;

  return (
    <div className="flex flex-col items-center gap-2" role="group" aria-label={t('assistant.listen')}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-pressed={isListening}
        aria-describedby="voice-status-label"
        aria-label={getLabel()}
        title={getLabel()}
        className={`relative flex items-center justify-center rounded-full border-4 border-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 ${sizeClasses[size]} ${
          isListening
            ? 'animate-mic-pulse border-red-100 bg-red-500 text-white'
            : voiceState === 'error'
              ? 'border-red-100 bg-red-950/40 text-red-400'
              : voiceState === 'speaking' || isPaused
                ? 'border-amber-100 bg-amber-400 text-slate-950'
                : isProcessing
                  ? 'border-teal-100 bg-teal-500 text-white'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
        }`}
      >
        {isListening ? (
          <Mic className="h-1/2 w-1/2" aria-hidden="true" />
        ) : isProcessing ? (
          <Loader2 className="h-1/2 w-1/2 animate-spin" aria-hidden="true" />
        ) : isSpeaking ? (
          <Volume2 className="h-1/2 w-1/2" aria-hidden="true" />
        ) : isUnsupported ? (
          <MicOff className="h-1/2 w-1/2" aria-hidden="true" />
        ) : (
          <Mic className="h-1/2 w-1/2" aria-hidden="true" />
        )}
      </button>
      <span
        id="voice-status-label"
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isListening
            ? 'bg-red-950/40 text-red-400'
            : voiceState === 'speaking' || isPaused
              ? 'bg-amber-950/60 text-amber-300'
              : voiceState === 'error' || isUnsupported
                ? 'bg-red-950/40 text-red-400'
                : 'bg-slate-900 text-slate-500'
        }`}
        role="status"
        aria-live="polite"
      >
        {getLabel()}
      </span>
    </div>
  );
}
