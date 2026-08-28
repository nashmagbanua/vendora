/**
 * Vendora Audio Notification Engine
 * Lightweight Web Audio API synthesizer for instant, zero-asset order sound alerts.
 */

class SoundNotificationService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const storedMute = localStorage.getItem('vendora_sound_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  /**
   * Lazily initialize AudioContext
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  /**
   * Check if sound is muted by user preference
   */
  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Toggle mute preference
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('vendora_sound_muted', String(muted));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Play a clean, modern dual-chime notification for incoming orders (D5 -> A5 -> C6)
   */
  public playNewOrderChime(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Handle suspended audio context (browser autoplay policies)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          // Autoplay blocked until user gesture, ignore silently
        });
      }

      const now = ctx.currentTime;

      // Primary chime tone (587.33Hz -> 880Hz -> 1046.5Hz)
      const notes = [
        { freq: 587.33, start: now, dur: 0.18, gain: 0.15 },
        { freq: 880.00, start: now + 0.12, dur: 0.22, gain: 0.18 },
        { freq: 1174.66, start: now + 0.24, dur: 0.45, gain: 0.20 }
      ];

      notes.forEach(({ freq, start, dur, gain: peakGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm sine wave with subtle triangle harmonic for bell timbre
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } catch (err) {
      // Audio playback failed (e.g., in strict background mode or unsupported environment)
      // Fail silently without blocking UI operations
    }
  }
}

export const soundService = new SoundNotificationService();
