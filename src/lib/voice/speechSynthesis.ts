'use client';

export interface TTSOptions {
  language?: string;
  rate?: number; // 0.5 to 2
  pitch?: number; // 0 to 2
  voiceURI?: string;
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeakingState = false;

  public onSpeakingChange?: (speaking: boolean) => void;
  public onWordBoundary?: (word: string) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public getIndonesianVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(v => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia'));
  }

  public speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      if (!text || text.trim() === '') {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const lang = options.language || 'id-ID';
      utterance.lang = lang;
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;

      // Select matching voice
      const voices = this.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (options.voiceURI) {
        selectedVoice = voices.find(v => v.voiceURI === options.voiceURI);
      }

      if (!selectedVoice) {
        // Find best match for language
        if (lang.startsWith('id')) {
          selectedVoice = voices.find(v => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia')) 
            || voices.find(v => v.lang.includes('ID'));
        } else {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.onSpeakingChange?.(true);
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.onSpeakingChange?.(false);
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error', e);
        this.isSpeakingState = false;
        this.onSpeakingChange?.(false);
        resolve();
      };

      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          const word = text.substring(e.charIndex, e.charIndex + e.charLength);
          this.onWordBoundary?.(word);
        }
      };

      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
      this.onSpeakingChange?.(false);
    }
  }

  public pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

// Web Audio API Sound Effects (Zero external audio file dependencies)
export class SoundEffectsService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playMicStart() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio effect error', e);
    }
  }

  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Pleasant double chime: E5 -> G#5 -> B5
      const notes = [659.25, 830.61, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = ctx.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {
      console.warn('Audio effect error', e);
    }
  }

  public playWarning() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio effect error', e);
    }
  }
}

export const speechSynth = new SpeechSynthesisService();
export const soundEffects = new SoundEffectsService();
