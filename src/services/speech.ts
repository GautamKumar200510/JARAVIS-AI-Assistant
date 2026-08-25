// Speech Recognition and Text-To-Speech Service

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initRecognition();
      this.initSynth();
    }
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  private initSynth() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public isSynthesisSupported(): boolean {
    return this.synth !== null;
  }

  public startListening(handlers: SpeechRecognitionHandlers) {
    if (!this.recognition) {
      handlers.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Stop speaking if currently speaking
    this.stopSpeaking();

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      if (finalTranscript) {
        handlers.onResult?.(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        handlers.onResult?.(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let msg = event.error || 'Speech recognition error';
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        msg = 'Microphone permission was denied. Please grant microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        msg = 'No voice detected. Please try speaking closer to the microphone.';
      }
      handlers.onError?.(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      handlers.onError?.(err.message || 'Failed to start microphone');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public speak(
    text: string,
    options?: {
      pitch?: number;
      rate?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    if (!this.synth) return;

    this.stopSpeaking();

    // Clean text for speech synthesis
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .replace(/https?:\/\/[^\s]+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Pick best British / futuristic / clear voice if not explicitly selected
    const allVoices = this.getAvailableVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined = undefined;

    if (options?.voiceName) {
      selectedVoice = allVoices.find(v => v.name === options.voiceName);
    }

    if (!selectedVoice) {
      // Prioritize natural UK English or Google voices for authentic Jarvis tone
      selectedVoice =
        allVoices.find(v => v.lang.startsWith('en-GB') || v.name.includes('British') || v.name.includes('UK English')) ||
        allVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        allVoices.find(v => v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Samantha')) ||
        allVoices.find(v => v.lang.startsWith('en')) ||
        allVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = options?.pitch ?? 1.0;
    utterance.rate = options?.rate ?? 1.05;

    utterance.onstart = () => {
      this.isSpeaking = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      this.isSpeaking = false;
      options?.onError?.(err);
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
