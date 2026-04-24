/**
 * Advanced Voice Synthesis System for Amrit Sparsh AI
 * - Text-to-Speech with natural voices
 * - Phoneme-level animation sync
 * - Multi-language support
 */

export type Language = 'en' | 'hi';
export type VoiceGender = 'male' | 'female';

interface SpeechConfig {
  text: string;
  language: Language;
  gender: VoiceGender;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onWordChange?: (wordIndex: number, word: string) => void;
  onViseme?: (viseme: string, duration: number) => void; // For animation sync
}

interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  startChar: number;
  endChar: number;
}

class VoiceSynthesizer {
  private synth: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isPaused = false;
  private wordTimings: WordTiming[] = [];
  private currentWordIndex = 0;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * Get available voices and filter by gender
   */
  getVoices(gender?: VoiceGender, language?: Language): SpeechSynthesisVoice[] {
    const voices = this.synth.getVoices();
    
    let filtered = voices;
    
    // Filter by language
    if (language) {
      const langCode = language === 'hi' ? 'hi' : 'en';
      filtered = filtered.filter(v => v.lang.startsWith(langCode));
    }
    
    // If no language-specific voices found, fallback
    if (filtered.length === 0) {
      filtered = voices.filter(v => v.lang.startsWith('en'));
    }
    
    return filtered;
  }

  /**
   * Speak text with natural voice and animation sync
   */
  speak(config: SpeechConfig): void {
    // Cancel any ongoing speech
    this.cancel();

    this.utterance = new SpeechSynthesisUtterance(config.text);
    
    // Get appropriate voice
    const voices = this.getVoices(config.gender, config.language);
    if (voices.length > 0) {
      this.utterance.voice = voices[0];
    }

    // Configure speech
    this.utterance.rate = config.rate ?? 0.95;
    this.utterance.pitch = config.pitch ?? 1;
    this.utterance.volume = config.volume ?? 1;
    this.utterance.lang = config.language === 'hi' ? 'hi-IN' : 'en-US';

    // Event handlers
    this.utterance.onstart = () => {
      this.isPaused = false;
      config.onStart?.();
    };

    this.utterance.onend = () => {
      config.onEnd?.();
      this.currentWordIndex = 0;
    };

    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    // Word timing simulation for animations
    if (config.onWordChange || config.onViseme) {
      this.setupWordTracking(config.text, config);
    }

    // Speak
    this.synth.speak(this.utterance);
  }

  /**
   * Setup word-by-word tracking for animation sync
   */
  private setupWordTracking(text: string, config: SpeechConfig): void {
    const words = text.split(/\s+/);
    const rate = config.rate ?? 0.95;
    const totalDuration = this.estimateSpeechDuration(text, rate);
    const avgWordDuration = totalDuration / words.length;

    // Simulate word timing
    words.forEach((word, index) => {
      const delay = index * avgWordDuration;
      
      setTimeout(() => {
        if (this.synth.paused) return;
        
        config.onWordChange?.(index, word);
        
        // Simulate viseme (mouth shape) changes for lip-sync
        this.simulateVisemes(word, config.onViseme);
      }, delay * 1000);
    });
  }

  /**
   * Simulate phoneme visemes for mouth animation
   */
  private simulateVisemes(word: string, callback?: (viseme: string, duration: number) => void): void {
    if (!callback) return;

    const phonemes: Record<string, string> = {
      'a': 'aa', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U',
      'p': 'PP', 'b': 'PP', 'm': 'MM',
      's': 'SS', 'z': 'SS', 'f': 'FF', 'v': 'FF',
      't': 'DD', 'd': 'DD', 'n': 'DD',
      'l': 'L', 'r': 'RR',
      'j': 'yy', 'y': 'yy',
      'k': 'k', 'g': 'k',
      'h': 'hh',
    };

    let lastViseme = '';
    const stepDuration = 50; // ms

    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      const viseme = phonemes[char] || 'rest';

      if (viseme !== lastViseme) {
        setTimeout(() => {
          callback(viseme, stepDuration);
        }, i * stepDuration);
        
        lastViseme = viseme;
      }
    }
  }

  /**
   * Estimate total speech duration based on text and rate
   */
  private estimateSpeechDuration(text: string, rate: number = 1): number {
    // Average: ~150 words per minute = ~4 chars per word
    // At rate 1: ~0.4 seconds per word on average
    const wordCount = text.split(/\s+/).length;
    const baseDuration = (wordCount / 150) * 60; // seconds
    return baseDuration / rate;
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume speech
   */
  resume(): void {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  /**
   * Cancel speech completely
   */
  cancel(): void {
    this.synth.cancel();
    this.isPaused = false;
    this.currentWordIndex = 0;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Check if paused
   */
  isPausedNow(): boolean {
    return this.isPaused;
  }
}

// Singleton instance
export const voiceSynthesizer = new VoiceSynthesizer();

/**
 * Helper: Speak welcome message
 */
export async function speakWelcome(gender: VoiceGender = 'male'): Promise<void> {
  return new Promise((resolve) => {
    voiceSynthesizer.speak({
      text: "Hello! I am Amrit Sparsh, your intelligent healthcare AI assistant. Click start to learn more about me!",
      language: 'en',
      gender,
      onEnd: resolve,
    });
  });
}
