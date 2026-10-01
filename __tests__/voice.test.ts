import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebSpeechProvider } from '@/lib/voice/web-speech-provider';

class FakeUtterance {
  public lang = '';
  public rate = 0;
  public volume = 0;
  public voice?: { lang: string };
  public onstart?: () => void;
  public onend?: () => void;
  public onerror?: (event: unknown) => void;
  constructor(public text: string) {}
}

class FakeRecognition {
  static last: FakeRecognition;
  public lang = '';
  public continuous = false;
  public interimResults = false;
  public onstart?: () => void;
  public onresult?: (event: { results: unknown[] }) => void;
  public onend?: () => void;
  public onerror?: (event: unknown) => void;
  public start = vi.fn(() => this.onstart?.());
  public stop = vi.fn(() => this.onend?.());
  public abort = vi.fn();

  constructor() { FakeRecognition.last = this; }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('WebSpeechProvider', () => {
  it('accumulates final and interim chunks and emits the transcript only when recognition ends', () => {
    vi.stubGlobal('window', { SpeechRecognition: FakeRecognition });
    const provider = new WebSpeechProvider();
    const onResult = vi.fn();
    const onEnd = vi.fn();
    const onError = vi.fn();

    provider.startListening({ language: 'en', continuous: true, onResult, onEnd, onError });
    const recognition = FakeRecognition.last;
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);

    const finalChunk = Object.assign([{ transcript: 'I need help' }], { isFinal: true });
    const interimChunk = Object.assign([{ transcript: 'starting a tailoring business' }], { isFinal: false });
    recognition.onresult?.({ results: [finalChunk, interimChunk] });

    expect(onResult).toHaveBeenLastCalledWith('I need help starting a tailoring business', false);
    expect(onEnd).not.toHaveBeenCalled();

    recognition.onend?.();
    expect(onEnd).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledWith('I need help starting a tailoring business');
    expect(onError).not.toHaveBeenCalled();
  });

  it('speaks the canonical text with the selected locale and matching browser voice', async () => {
    const tamilVoice = { lang: 'ta-IN' };
    const synth = {
      speaking: false,
      paused: false,
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => [{ lang: 'en-US' }, tamilVoice]),
    };
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    const provider = new WebSpeechProvider();
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const canonicalText = 'வணக்கம். உங்கள் மாநிலம் எது?';

    provider.speak(canonicalText, { language: 'ta', onStart, onEnd });
    await vi.waitFor(() => expect(synth.speak).toHaveBeenCalledOnce());
    const utterance = synth.speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe(canonicalText);
    expect(utterance.lang).toBe('ta-IN');
    expect(utterance.voice).toBe(tamilVoice);
    expect(utterance.volume).toBe(1);
    expect(synth.cancel).toHaveBeenCalledOnce();
    expect(synth.resume).toHaveBeenCalledOnce();

    utterance.onstart?.();
    utterance.onend?.();
    expect(onStart).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('waits for a browser voiceschanged event before speaking', async () => {
    let availableVoices: Array<{ lang: string }> = [];
    let voicesChanged: (() => void) | undefined;
    const englishVoice = { lang: 'en-US' };
    const synth = {
      speaking: false,
      paused: false,
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => availableVoices),
      addEventListener: vi.fn((_event: string, listener: () => void) => { voicesChanged = listener; }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    const provider = new WebSpeechProvider();

    provider.speak('A verified government service.', { language: 'en' });
    expect(synth.speak).not.toHaveBeenCalled();
    availableVoices = [englishVoice];
    voicesChanged?.();
    await vi.waitFor(() => expect(synth.speak).toHaveBeenCalledOnce());
    const utterance = synth.speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.voice).toBe(englishVoice);
    expect(synth.removeEventListener).toHaveBeenCalledOnce();
  });

  it('reports a clear no-voice condition instead of invoking broken synthesis', async () => {
    vi.useFakeTimers();
    const synth = {
      speaking: false,
      paused: false,
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    const provider = new WebSpeechProvider();
    const onError = vi.fn();

    provider.speak('A verified government service.', { language: 'en', onError });
    await vi.advanceTimersByTimeAsync(1200);

    expect(onError).toHaveBeenCalledWith('no-voices');
    expect(synth.speak).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('supports pause, resume, and stop through the existing speech provider', () => {
    const synth = {
      speaking: true,
      paused: false,
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(() => { synth.paused = true; }),
      resume: vi.fn(() => { synth.paused = false; }),
      getVoices: vi.fn(() => []),
    };
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    const provider = new WebSpeechProvider();

    provider.pauseSpeaking();
    expect(synth.pause).toHaveBeenCalledOnce();
    provider.resumeSpeaking();
    expect(synth.resume).toHaveBeenCalledOnce();
    provider.stopSpeaking();
    expect(synth.cancel).toHaveBeenCalledOnce();
  });
});
