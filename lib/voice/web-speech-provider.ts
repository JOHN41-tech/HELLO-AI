import { VoiceProvider, SpeechToTextOptions, TextToSpeechOptions } from '@/types/voice';
import { getLanguageConfig } from '@/lib/i18n/languages';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function compactTranscript(parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export class WebSpeechProvider implements VoiceProvider {
  private recognition: any = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private speechRequestId = 0;

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isTTSSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  private waitForVoices(synthesis: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
    const initialVoices = synthesis.getVoices?.() ?? [];
    if (initialVoices.length > 0) return Promise.resolve(initialVoices);

    return new Promise((resolve) => {
      let resolved = false;
      let timeout: ReturnType<typeof setTimeout>;
      const finish = (waitExpired = false) => {
        const voices = synthesis.getVoices?.() ?? [];
        if (resolved || (!waitExpired && voices.length === 0)) return;
        resolved = true;
        clearTimeout(timeout);
        synthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
        resolve(voices);
      };
      const handleVoicesChanged = () => finish();

      synthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
      timeout = setTimeout(() => finish(true), 1200);
    });
  }

  public startListening(options: SpeechToTextOptions): void {
    if (!this.isSTTSupported()) {
      options.onError('Speech recognition is not supported in this browser.');
      options.onStateChange?.('unsupported');
      return;
    }

    try {
      if (this.recognition) {
        try { this.recognition.abort?.(); } catch { /* Ignore stale recognizer shutdown errors. */ }
        this.recognition = null;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = true;

      const langConfig = getLanguageConfig(options.language);
      recognition.lang = options.locale || langConfig.locale;

      let completeTranscript = '';
      recognition.onstart = () => options.onStateChange?.('listening');

      recognition.onresult = (event: any) => {
        const finalParts: string[] = [];
        const interimParts: string[] = [];
        for (let index = 0; index < event.results.length; index += 1) {
          const item = event.results[index];
          const text = String(item?.[0]?.transcript ?? '').trim();
          if (!text) continue;
          if (item.isFinal) finalParts.push(text);
          else interimParts.push(text);
        }

        const finalTranscript = compactTranscript(finalParts);
        const interimTranscript = compactTranscript(interimParts);
        completeTranscript = compactTranscript([finalTranscript, interimTranscript]);
        options.onResult(completeTranscript, Boolean(finalTranscript) && !interimTranscript);
        // Interim results are preview-only. Keep the UI in listening mode until end/stop.
        options.onStateChange?.('listening');
      };

      recognition.onerror = (event: any) => {
        const code = typeof event?.error === 'string' ? event.error : '';
        options.onError(code || 'Speech input error');
        options.onStateChange?.('error');
      };

      recognition.onend = () => {
        if (this.recognition === recognition) this.recognition = null;
        options.onStateChange?.('idle');
        options.onEnd?.(completeTranscript.trim());
      };

      recognition.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone initiation failed';
      options.onError(message);
      options.onStateChange?.('error');
    }
  }

  public stopListening(): void {
    const recognition = this.recognition;
    if (!recognition) return;
    try {
      // stop(), unlike abort(), asks the browser for a final result before onend.
      recognition.stop();
    } catch (error) {
      console.warn('Error stopping speech recognition:', error instanceof Error ? error.name : 'unknown');
    }
  }

  public speak(text: string, options: TextToSpeechOptions): void {
    if (!this.isTTSSupported()) {
      options.onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) {
      options.onError?.('There is no text to read aloud.');
      return;
    }

    const synthesis = window.speechSynthesis;
    const requestId = ++this.speechRequestId;
    try {
      synthesis.cancel();
      // Some browsers remain paused after an interrupted utterance; resume before enqueueing.
      synthesis.resume?.();
      void this.speakWhenVoiceReady(cleanText, options, synthesis, requestId);
    } catch (error) {
      this.activeUtterance = null;
      options.onError?.(error instanceof Error ? error.message : 'Speech output failed.');
    }
  }

  private async speakWhenVoiceReady(
    text: string,
    options: TextToSpeechOptions,
    synthesis: SpeechSynthesis,
    requestId: number
  ): Promise<void> {
    const voices = await this.waitForVoices(synthesis);
    if (requestId !== this.speechRequestId) return;
    if (voices.length === 0) {
      options.onError?.('no-voices');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const langConfig = getLanguageConfig(options.language);
      const locale = options.locale || langConfig.locale;
      utterance.lang = locale;
      utterance.rate = 0.92;
      utterance.volume = 1;

      const requested = locale.toLowerCase();
      const primaryLanguage = requested.split('-')[0];
      const matchingVoice = voices.find((voice) => voice.lang.toLowerCase() === requested)
        ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${primaryLanguage}-`))
        ?? voices.find((voice) => voice.default);
      if (matchingVoice) utterance.voice = matchingVoice;

      this.activeUtterance = utterance;
      utterance.onstart = () => options.onStart?.();
      utterance.onend = () => {
        if (this.activeUtterance === utterance) this.activeUtterance = null;
        options.onEnd?.();
      };
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (this.activeUtterance === utterance) this.activeUtterance = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          options.onError?.(`speech-error:${event.error || 'unknown'}`);
        }
      };
      synthesis.speak(utterance);
    } catch (error) {
      this.activeUtterance = null;
      options.onError?.(error instanceof Error ? error.message : 'speech-error:unknown');
    }
  }

  public stopSpeaking(): void {
    this.speechRequestId += 1;
    if (this.isTTSSupported()) {
      this.activeUtterance = null;
      window.speechSynthesis.cancel();
    }
  }

  public pauseSpeaking(): void {
    if (this.isTTSSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeaking(): void {
    if (this.isTTSSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export const webSpeechProvider = new WebSpeechProvider();
