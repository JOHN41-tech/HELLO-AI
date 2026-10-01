'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { VoiceState } from '@/types/voice';
import { LanguageCode } from '@/types/language';
import { webSpeechProvider } from '@/lib/voice/web-speech-provider';
import { translateKey } from '@/lib/i18n/localization';

interface VoiceSnapshot {
  state: VoiceState;
  ownerId: string | null;
}

const initialVoiceSnapshot: VoiceSnapshot = { state: 'idle', ownerId: null };
let voiceSnapshot = initialVoiceSnapshot;
const voiceListeners = new Set<() => void>();

function subscribeToVoice(listener: () => void) {
  voiceListeners.add(listener);
  return () => voiceListeners.delete(listener);
}

function publishVoiceState(state: VoiceState, ownerId?: string | null) {
  const nextOwnerId = ownerId !== undefined
    ? ownerId
    : state === 'idle' || state === 'error' || state === 'unsupported'
      ? null
      : voiceSnapshot.ownerId;
  if (voiceSnapshot.state === state && voiceSnapshot.ownerId === nextOwnerId) return;
  voiceSnapshot = { state, ownerId: nextOwnerId };
  voiceListeners.forEach((listener) => listener());
}

export function useVoice(language: LanguageCode, voiceOwnerId?: string) {
  const snapshot = useSyncExternalStore(
    subscribeToVoice,
    () => voiceSnapshot,
    () => initialVoiceSnapshot
  );
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSTTSupported = webSpeechProvider.isSTTSupported();
  const isTTSSupported = webSpeechProvider.isTTSSupported();

  const startListening = useCallback(
    (onFinalResult?: (text: string) => void | Promise<void>) => {
      setErrorMessage(null);
      setTranscript('');
      publishVoiceState('listening', null);

      webSpeechProvider.startListening({
        language,
        continuous: true,
        onResult: (text) => setTranscript(text),
        onEnd: (completeTranscript) => {
          setTranscript(completeTranscript);
          if (completeTranscript.trim()) {
            publishVoiceState('processing', null);
            const submission = onFinalResult?.(completeTranscript.trim());
            if (submission && typeof (submission as Promise<void>).finally === 'function') {
              void (submission as Promise<void>).finally(() => {
                if (voiceSnapshot.state === 'processing') publishVoiceState('idle', null);
              });
            } else {
              publishVoiceState('idle', null);
            }
          } else {
            publishVoiceState('idle', null);
          }
        },
        onError: (error) => {
          setErrorMessage(error);
          publishVoiceState('error', null);
        },
        onStateChange: (state) => publishVoiceState(state, state === 'listening' ? null : undefined),
      });
    },
    [language]
  );

  const stopListening = useCallback(() => {
    // stop(), unlike abort(), asks the browser for a final result before onend.
    webSpeechProvider.stopListening();
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void, ownerId: string = voiceOwnerId ?? 'voice-output') => {
      setErrorMessage(null);
      publishVoiceState('speaking', ownerId);
      webSpeechProvider.speak(text, {
        language,
        onStart: () => publishVoiceState('speaking', ownerId),
        onEnd: () => {
          if (voiceSnapshot.ownerId === ownerId) publishVoiceState('idle', null);
          onEnd?.();
        },
        onError: () => {
          setErrorMessage(translateKey(language, 'errors.speechUnavailable'));
          if (voiceSnapshot.ownerId === ownerId) publishVoiceState('idle', null);
        },
      });
    },
    [language, voiceOwnerId]
  );

  const stopSpeaking = useCallback(() => {
    webSpeechProvider.stopSpeaking();
    publishVoiceState('idle', null);
  }, []);

  const pauseSpeaking = useCallback(() => {
    webSpeechProvider.pauseSpeaking();
    if (voiceSnapshot.state === 'speaking') publishVoiceState('paused', voiceSnapshot.ownerId);
  }, []);

  const resumeSpeaking = useCallback(() => {
    webSpeechProvider.resumeSpeaking();
    if (voiceSnapshot.state === 'paused') publishVoiceState('speaking', voiceSnapshot.ownerId);
  }, []);

  useEffect(() => {
    return () => {
      if (!voiceOwnerId) webSpeechProvider.stopListening();
      if (!voiceOwnerId || voiceSnapshot.ownerId === voiceOwnerId) {
        webSpeechProvider.stopSpeaking();
        publishVoiceState('idle', null);
      }
    };
  }, [voiceOwnerId]);

  return {
    voiceState: snapshot.state,
    activeVoiceOwnerId: snapshot.ownerId,
    transcript,
    errorMessage,
    isSTTSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
  };
}
