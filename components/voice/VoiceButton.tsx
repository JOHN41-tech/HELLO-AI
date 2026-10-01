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
}

export function VoiceButton({
  voiceState,
  onStartListening,
  onStopListening,
  size = 'hero',
}: VoiceButtonProps) {
  const { t } = useLanguage();

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isSpeaking = voiceState === 'speaking';
  const isUnsupported = voiceState === 'unsupported';

  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const getLabel = () => {
    if (isListening) return t('conversation.listening');
    if (isProcessing) return t('conversation.processing');
    if (isSpeaking) return t('assistant.speak');
    if (isUnsupported) return t('errors.voiceUnavailable');
    return t('assistant.listen');
  };

  const sizeClasses = {
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
    hero: 'w-28 h-28 text-4xl sm:w-32 sm:h-32 sm:text-5xl',
  };

  return (
    <div className="flex flex-col items-center gap-3 my-2">
      <button
        onClick={handleClick}
        disabled={isUnsupported}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-2xl focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:outline-none ${
          sizeClasses[size]
        } ${
          isListening
            ? 'bg-red-500 text-white animate-mic-pulse scale-105 shadow-red-500/50'
            : isSpeaking
            ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-500/50'
            : isProcessing
            ? 'bg-teal-500 text-slate-950 scale-100 shadow-teal-500/50'
            : 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 hover:scale-105 active:scale-95 shadow-emerald-500/30'
        }`}
        aria-label={getLabel()}
        title={getLabel()}
      >
        {isListening ? (
          <Mic className="w-1/2 h-1/2 animate-bounce" />
        ) : isProcessing ? (
          <Loader2 className="w-1/2 h-1/2 animate-spin" />
        ) : isSpeaking ? (
          <Volume2 className="w-1/2 h-1/2 animate-pulse" />
        ) : isUnsupported ? (
          <MicOff className="w-1/2 h-1/2 text-slate-400" />
        ) : (
          <Mic className="w-1/2 h-1/2" />
        )}
      </button>

      <span
        className={`text-sm sm:text-base font-bold tracking-wide px-4 py-1.5 rounded-full backdrop-blur ${
          isListening
            ? 'text-red-400 bg-red-950/60 border border-red-500/30 animate-pulse'
            : isSpeaking
            ? 'text-amber-300 bg-amber-950/60 border border-amber-500/30'
            : 'text-emerald-300 bg-slate-900/80 border border-slate-800'
        }`}
      >
        {getLabel()}
      </span>
    </div>
  );
}
