'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { LanguageCode } from '@/types/language';
import { useLanguage } from '@/hooks/useLanguage';

export interface VoicePlaybackButtonProps {
  text: string;
  language: LanguageCode;
}

export function VoicePlaybackButton({ text, language }: VoicePlaybackButtonProps) {
  const { t } = useLanguage();
  const { speak, stopSpeaking, voiceState } = useVoice(language);
  const isPlaying = voiceState === 'speaking';

  const toggleSpeech = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const toggleLabel = isPlaying ? t('assistant.stopAudio') : t('assistant.replay');

  return (
    <button
      onClick={toggleSpeech}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
        isPlaying
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
      }`}
      aria-label={toggleLabel}
      title={toggleLabel}
    >
      {isPlaying ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      <span>{toggleLabel}</span>
    </button>
  );
}
