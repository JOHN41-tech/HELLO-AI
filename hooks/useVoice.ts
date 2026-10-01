'use client';

import { useState, useCallback, useEffect } from 'react';
import { VoiceState } from '@/types/voice';
import { LanguageCode } from '@/types/language';
import { webSpeechProvider } from '@/lib/voice/web-speech-provider';

export function useVoice(language: LanguageCode) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSTTSupported = webSpeechProvider.isSTTSupported();
  const isTTSSupported = webSpeechProvider.isTTSSupported();

  const startListening = useCallback(
    (onFinalResult?: (text: string) => void) => {
      setErrorMessage(null);
      setTranscript('');

      webSpeechProvider.startListening({
        language,
        continuous: false,
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            setVoiceState('processing');
            onFinalResult?.(text);
          }
        },
        onError: (err) => {
          setErrorMessage(err);
          setVoiceState('error');
        },
        onStateChange: (state) => {
          setVoiceState(state);
        },
      });
    },
    [language]
  );

  const stopListening = useCallback(() => {
    webSpeechProvider.stopListening();
    setVoiceState('idle');
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      setVoiceState('speaking');
      webSpeechProvider.speak(text, {
        language,
        onStart: () => setVoiceState('speaking'),
        onEnd: () => {
          setVoiceState('idle');
          onEnd?.();
        },
        onError: (err) => {
          setErrorMessage(err);
          setVoiceState('error');
        },
      });
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    webSpeechProvider.stopSpeaking();
    setVoiceState('idle');
  }, []);

  useEffect(() => {
    return () => {
      webSpeechProvider.stopListening();
      webSpeechProvider.stopSpeaking();
    };
  }, []);

  return {
    voiceState,
    transcript,
    errorMessage,
    isSTTSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
