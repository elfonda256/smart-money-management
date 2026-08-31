'use client';

// Cross-browser Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private language = 'id-ID';

  public onTranscriptChange?: (interim: string, isFinal: boolean) => void;
  public onError?: (error: string) => void;
  public onStateChange?: (listening: boolean) => void;

  constructor(lang: string = 'id-ID') {
    this.language = lang;
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition
    );
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // single command turn
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange?.(true);
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
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
          this.onTranscriptChange?.(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.onTranscriptChange?.(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('SpeechRecognition error:', event.error);
        this.isListening = false;
        this.onStateChange?.(false);
        this.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChange?.(false);
      };
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition', e);
    }
  }

  public setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      this.onError?.('browser_not_supported');
      return;
    }

    try {
      this.recognition.lang = this.language;
      this.recognition.start();
    } catch (e: any) {
      // If already started, ignore or restart
      if (e.name !== 'InvalidStateError') {
        console.error('Error starting speech recognition', e);
        this.onError?.(e.message || 'start_failed');
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition', e);
      }
    }
    this.isListening = false;
    this.onStateChange?.(false);
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}
