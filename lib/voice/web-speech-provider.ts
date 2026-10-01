import { VoiceProvider, SpeechToTextOptions, TextToSpeechOptions } from '@/types/voice';
import { getLanguageConfig } from '@/lib/i18n/languages';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class WebSpeechProvider implements VoiceProvider {
  private recognition: any = null;

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isTTSSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public startListening(options: SpeechToTextOptions): void {
    if (!this.isSTTSupported()) {
      options.onError('Speech recognition is not supported in this browser.');
      options.onStateChange?.('unsupported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = true;

      const langConfig = getLanguageConfig(options.language);
      this.recognition.lang = options.locale || langConfig.locale;

      this.recognition.onstart = () => {
        options.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        options.onStateChange?.('processing');
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          options.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          options.onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('WebSpeech error:', event.error);
        options.onError(event.error || 'Speech input error');
        options.onStateChange?.('error');
      };

      this.recognition.onend = () => {
        options.onStateChange?.('idle');
      };

      this.recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      options.onError(err.message || 'Microphone initiation failed');
      options.onStateChange?.('error');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      this.recognition = null;
    }
  }

  public speak(text: string, options: TextToSpeechOptions): void {
    if (!this.isTTSSupported()) {
      options.onError?.('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langConfig = getLanguageConfig(options.language);
    utterance.lang = options.locale || langConfig.locale;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      options.onError?.('Speech output error');
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isTTSSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const webSpeechProvider = new WebSpeechProvider();
