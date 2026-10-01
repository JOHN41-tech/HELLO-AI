import { LanguageCode } from './language';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused' | 'error' | 'unsupported';

export interface SpeechToTextOptions {
  language: LanguageCode;
  locale?: string;
  continuous?: boolean;
  onResult: (text: string, isFinal: boolean) => void;
  onEnd?: (completeTranscript: string) => void;
  onError: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

export interface TextToSpeechOptions {
  language: LanguageCode;
  locale?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface VoiceProvider {
  isSTTSupported(): boolean;
  isTTSSupported(): boolean;
  startListening(options: SpeechToTextOptions): void;
  stopListening(): void;
  speak(text: string, options: TextToSpeechOptions): void;
  pauseSpeaking(): void;
  resumeSpeaking(): void;
  stopSpeaking(): void;
}
