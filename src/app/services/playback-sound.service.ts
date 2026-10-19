import { Injectable, OnDestroy } from '@angular/core';

export type PlaybackSound = 'trackChange' | 'playlistEnd' | 'playlistLoop';

@Injectable({ providedIn: 'root' })
export class PlaybackSoundService implements OnDestroy {
  frequencyHz = 1000;
  volume = 0.2;
  wordsPerMinute = 12;

  // Morse code mapping
  private MORSE: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
    '@': '.--.-.', ' ': ' '
  };

  private audioContext: AudioContext | null = null;
  private readonly patterns: Record<PlaybackSound, string> = {
    trackChange: 'N',
    playlistEnd: 'E',
    playlistLoop: 'R'
  };

  prepare(): void {
    try {
      void this.getAudioContext().resume().catch(error => {
        console.warn('Unable to activate playback notifications:', error);
      });
    } catch (error) {
      console.warn('Unable to initialize playback notifications:', error);
    }
  }

  play(sound: PlaybackSound): void {
    void this.playPattern(this.patterns[sound]);
  }

  private async playPattern(character: string): Promise<void> {
    try {
      const pattern = this.MORSE[character.toUpperCase()];
      if (!pattern) {
        return;
      }

      const context = this.getAudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }

      const unitSeconds = 1.2 / Math.max(1, this.wordsPerMinute);
      const startTime = context.currentTime + 0.05;
      let cursor = startTime;

      for (const symbol of pattern) {
        const duration = symbol === '-' ? unitSeconds * 3 : unitSeconds;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const attack = Math.min(0.008, duration / 4);

        oscillator.type = 'sine';
        oscillator.frequency.value = Math.min(1500, Math.max(800, this.frequencyHz));
        gain.gain.setValueAtTime(0, cursor);
        gain.gain.linearRampToValueAtTime(Math.min(1, Math.max(0, this.volume)), cursor + attack);
        gain.gain.setValueAtTime(Math.min(1, Math.max(0, this.volume)), cursor + duration - attack);
        gain.gain.linearRampToValueAtTime(0, cursor + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(cursor);
        oscillator.stop(cursor + duration + 0.01);

        cursor += duration + unitSeconds;
      }
    } catch (error) {
      console.warn('Unable to play playback notification:', error);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error('Web Audio API is not supported by this browser.');
      }
      this.audioContext = new AudioContextConstructor();
    }

    return this.audioContext;
  }

  ngOnDestroy(): void {
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }
}