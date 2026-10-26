// Web Audio API Synthesizer for high-fidelity Ludo game audio & background music

// Musical note frequencies (Hz)
const NOTES: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// 64-step (8 bars of 8th notes @ 114 BPM) cheerful Ludo board game melody score
const BGM_MELODY: (string | null)[] = [
  // Bar 1 - C Major bounce
  'C5', 'E5', 'G5', 'E5', 'G5', 'A5', 'G5', 'E5',
  // Bar 2 - G Major joyful steps
  'D5', 'F5', 'E5', 'D5', 'B4', 'C5', 'D5', null,
  // Bar 3 - A minor groove
  'E5', 'A5', 'C6', 'B5', 'A5', 'G5', 'E5', 'D5',
  // Bar 4 - Turnaround
  'C5', 'D5', 'E5', 'G5', 'F5', 'E5', 'D5', null,
  // Bar 5 - Uplifting phrase
  'G5', 'C6', 'E6', 'D6', 'C6', 'A5', 'G5', 'E5',
  // Bar 6 - Playful run
  'A5', 'C6', 'A5', 'F5', 'G5', 'B5', 'D6', null,
  // Bar 7 - Cascade
  'E6', 'D6', 'C6', 'B5', 'C6', 'A5', 'G5', 'E5',
  // Bar 8 - Cheerful resolution
  'F5', 'G5', 'A5', 'B5', 'C6', null, 'C6', null,
];

// Bassline score (walking acoustic bass)
const BGM_BASS: (string | null)[] = [
  // Bar 1
  'C3', null, 'G2', null, 'C3', null, 'E3', null,
  // Bar 2
  'G2', null, 'D3', null, 'G2', null, 'B2', null,
  // Bar 3
  'A2', null, 'E3', null, 'A2', null, 'C3', null,
  // Bar 4
  'F2', null, 'A2', null, 'G2', null, 'B2', null,
  // Bar 5
  'C3', null, 'G2', null, 'C3', null, 'E3', null,
  // Bar 6
  'F2', null, 'A2', null, 'G2', null, 'D3', null,
  // Bar 7
  'E2', null, 'G2', null, 'A2', null, 'E3', null,
  // Bar 8
  'F2', null, 'G2', null, 'C3', null, 'C2', null,
];

// Soft backing harmony pluck
const BGM_HARMONY: (string | null)[] = [
  null, 'G4', null, 'E4', null, 'G4', null, 'C4',
  null, 'G4', null, 'D4', null, 'G4', null, null,
  null, 'E4', null, 'C4', null, 'E4', null, 'A3',
  null, 'F4', null, 'D4', null, 'F4', null, null,
  null, 'G4', null, 'E4', null, 'G4', null, 'C4',
  null, 'A4', null, 'F4', null, 'B4', null, null,
  null, 'G4', null, 'E4', null, 'E4', null, 'A3',
  null, 'A4', null, 'B4', null, null, 'G4', null,
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private wasBgmPlayingBeforeHide: boolean = false;
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmCurrentStep: number = 0;
  private bgmNextStepTime: number = 0;
  private readonly stepDuration: number = 60 / 114 / 2; // ~0.263s per eighth note

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // User requirement 6: When leaving the app/switching tab, mute all audio/BGM immediately. Resume on re-entry.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.handleAppLeave();
        } else {
          this.handleAppResume();
        }
      });

      window.addEventListener('pagehide', () => {
        this.handleAppLeave();
      });

      window.addEventListener('pageshow', () => {
        this.handleAppResume();
      });

      window.addEventListener('blur', () => {
        this.handleAppLeave();
      });

      window.addEventListener('focus', () => {
        this.handleAppResume();
      });
    }
  }

  public handleAppLeave() {
    if (this.isBgmPlaying) {
      this.wasBgmPlayingBeforeHide = true;
      this.stopBgm();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public handleAppResume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.wasBgmPlayingBeforeHide && this.bgmEnabled && this.soundEnabled) {
      this.wasBgmPlayingBeforeHide = false;
      this.startBgm();
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx && !this.masterGain) {
      // High-headroom Dynamics Compressor / Studio Limiter
      // Prevents digital clipping when sounds overlap at high volumes, maintaining maximum loudness
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      // High-volume master boost
      this.masterGain.gain.setValueAtTime(1.6, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getTarget(): AudioNode {
    return this.masterGain || this.ctx!.destination;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    } else if (this.soundEnabled && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying && this.bgmEnabled && this.soundEnabled;
  }

  public getBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  // ==================== BACKGROUND MUSIC ENGINE ====================
  public startBgm() {
    if (!this.soundEnabled || !this.bgmEnabled) return;
    if (this.isBgmPlaying) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      // Handle mobile browser autoplay policy
      if (this.ctx.state === 'suspended') {
        const resumeAudio = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          window.removeEventListener('click', resumeAudio);
          window.removeEventListener('touchstart', resumeAudio);
          window.removeEventListener('pointerdown', resumeAudio);
        };
        window.addEventListener('click', resumeAudio, { once: true });
        window.addEventListener('touchstart', resumeAudio, { once: true });
        window.addEventListener('pointerdown', resumeAudio, { once: true });
      }

      this.isBgmPlaying = true;
      const t = this.ctx.currentTime;

      // Master BGM Gain Node connected to master audio pipeline
      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.getTarget());
      }

      // Smooth fade-in to significantly boosted, loud and joyful background music volume (0.28)
      this.bgmGain.gain.cancelScheduledValues(t);
      this.bgmGain.gain.setValueAtTime(0.001, t);
      this.bgmGain.gain.linearRampToValueAtTime(0.28, t + 0.6);

      this.bgmCurrentStep = 0;
      this.bgmNextStepTime = t + 0.1;

      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
      }

      this.bgmTimer = setInterval(() => {
        this.scheduleBgmSteps();
      }, 40);
    } catch {
      // AudioContext may be suspended before user gesture
    }
  }

  public stopBgm() {
    if (!this.isBgmPlaying && !this.bgmTimer) return;
    this.isBgmPlaying = false;

    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }

    if (this.ctx && this.bgmGain) {
      try {
        const t = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(t);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, t);
        this.bgmGain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
      } catch {}
    }
  }

  private scheduleBgmSteps() {
    if (!this.ctx || !this.isBgmPlaying || !this.bgmGain) return;

    const scheduleAheadTime = 0.25; // seconds
    while (this.bgmNextStepTime < this.ctx.currentTime + scheduleAheadTime) {
      const step = this.bgmCurrentStep;
      const time = this.bgmNextStepTime;

      this.playBgmStep(step, time);

      this.bgmNextStepTime += this.stepDuration;
      this.bgmCurrentStep = (this.bgmCurrentStep + 1) % 64;
    }
  }

  private playBgmStep(step: number, time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const ctx = this.ctx;

    // 1. Lead Melody Note (Significantly Louder, Crisp Marimba / Kalimba timbre)
    const melodyNote = BGM_MELODY[step];
    if (melodyNote && NOTES[melodyNote]) {
      const freq = NOTES[melodyNote];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, time);
      filter.Q.setValueAtTime(1.0, time);

      // Elevated gain for punchy, joyful volume
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.65, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + this.stepDuration * 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + this.stepDuration);

      // Subtle metallic wooden mallet strike overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.76, time);
      overtoneGain.gain.setValueAtTime(0.12, time);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      overtone.connect(overtoneGain);
      overtoneGain.connect(this.bgmGain);
      overtone.start(time);
      overtone.stop(time + 0.05);
    }

    // 2. Harmony Pluck Note (Boosted)
    const harmNote = BGM_HARMONY[step];
    if (harmNote && NOTES[harmNote]) {
      const hFreq = NOTES[harmNote];
      const hOsc = ctx.createOscillator();
      const hGain = ctx.createGain();

      hOsc.type = 'sine';
      hOsc.frequency.setValueAtTime(hFreq, time);

      hGain.gain.setValueAtTime(0.001, time);
      hGain.gain.linearRampToValueAtTime(0.35, time + 0.01);
      hGain.gain.exponentialRampToValueAtTime(0.001, time + this.stepDuration * 0.8);

      hOsc.connect(hGain);
      hGain.connect(this.bgmGain);

      hOsc.start(time);
      hOsc.stop(time + this.stepDuration);
    }

    // 3. Walking Bass Note (Deep, Punchy & Louder)
    const bassNote = BGM_BASS[step];
    if (bassNote && NOTES[bassNote]) {
      const bFreq = NOTES[bassNote];
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      const bFilter = ctx.createBiquadFilter();

      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bFreq, time);

      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(320, time);

      bGain.gain.setValueAtTime(0.001, time);
      bGain.gain.linearRampToValueAtTime(0.55, time + 0.015);
      bGain.gain.exponentialRampToValueAtTime(0.001, time + this.stepDuration * 1.6);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.bgmGain);

      bOsc.start(time);
      bOsc.stop(time + this.stepDuration * 1.8);
    }

    // 4. Boosted Percussion Tracks
    // Soft wooden tap on beats 1 & 3
    if (step % 8 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(105, time);
      kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

      kickGain.gain.setValueAtTime(0.40, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.09);
    }

    // Woodblock / rim click on beats 2 & 4
    if (step % 8 === 4) {
      const rimOsc = ctx.createOscillator();
      const rimGain = ctx.createGain();
      rimOsc.type = 'triangle';
      rimOsc.frequency.setValueAtTime(950, time);
      rimOsc.frequency.exponentialRampToValueAtTime(560, time + 0.03);

      rimGain.gain.setValueAtTime(0.24, time);
      rimGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

      rimOsc.connect(rimGain);
      rimGain.connect(this.bgmGain);
      rimOsc.start(time);
      rimOsc.stop(time + 0.04);
    }

    // Shaker tick on off-beats
    if (step % 2 === 1) {
      const shakerOsc = ctx.createOscillator();
      const shakerGain = ctx.createGain();
      shakerOsc.type = 'square';
      shakerOsc.frequency.setValueAtTime(2600 + Math.random() * 600, time);

      shakerGain.gain.setValueAtTime(0.07, time);
      shakerGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      shakerOsc.connect(shakerGain);
      shakerGain.connect(this.bgmGain);
      shakerOsc.start(time);
      shakerOsc.stop(time + 0.025);
    }
  }

  // ==================== SOUND EFFECTS (SFX) ====================

  // Button click (Much Louder)
  public playClick() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.40, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.getTarget());

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  // Dice shake & roll (Significantly Louder & Rhythmic)
  public playDiceRoll() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'triangle' : 'square';
        const startFreq = 200 + Math.random() * 260;
        osc.frequency.setValueAtTime(startFreq, t + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(85, t + i * 0.06 + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, t + i * 0.06);

        // Substantially boosted roll rattles (0.45)
        gain.gain.setValueAtTime(0.45, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.055);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.getTarget());

        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.055);
      }
    } catch {}
  }

  // Token hopping on board with ascending pitch (গুটি গুলো চলার শব্দ - MUCH LOUDER)
  public playStepHop(stepNum: number = 1, totalSteps: number = 6) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 340 + Math.min(stepNum, 6) * 45;
      const endFreq = startFreq + 160;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.1);

      // Boosted from 0.2 to 0.58 for rich, loud, clear stepping sound
      gain.gain.setValueAtTime(0.58, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);

      osc.connect(gain);
      gain.connect(this.getTarget());

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }

  public playTokenHop() {
    this.playStepHop(1, 1);
  }

  // Token safe zone / star chime (গুটি স্টার হওয়ার শব্দ - MUCH LOUDER & RESONANT)
  public playSafeChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        // Boosted from 0.12 to 0.55 for unmistakable loud star chime
        gain.gain.setValueAtTime(0.55, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.getTarget());

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.35);
      });
    } catch {}
  }

  // Knockout capture smash sound (গুটি কাটার শব্দ - MUCH LOUDER & HEAVY IMPACT)
  public playCaptureSmash() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.28);

      // Heavy impact boost (0.70)
      gain.gain.setValueAtTime(0.70, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.getTarget());

      osc.start(t);
      osc.stop(t + 0.28);
    } catch {}
  }

  // Token reaches home (Center goal - MUCH LOUDER)
  public playHomeFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        // Boosted from 0.18 to 0.58
        gain.gain.setValueAtTime(0.58, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.getTarget());

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  // Realistic Firecracker & Fireworks Sound Synthesizer (বাজি ফাটার শব্দ - MUCH LOUDER)
  public playFireworks() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;

      const burstDelays = [0.05, 0.45, 0.95, 1.5];

      burstDelays.forEach((delay) => {
        const burstTime = t + delay;

        // 1. Rocket whistle ascent
        const whistle = ctx.createOscillator();
        const whistleGain = ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(450 + Math.random() * 200, burstTime - 0.2);
        whistle.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 400, burstTime);
        whistleGain.gain.setValueAtTime(0.18, burstTime - 0.2);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, burstTime);
        whistle.connect(whistleGain);
        whistleGain.connect(this.getTarget());
        whistle.start(burstTime - 0.2);
        whistle.stop(burstTime);

        // 2. Heavy explosion BOOM (Low-end thump - LOUD & PUNCHY)
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.type = 'triangle';
        boomOsc.frequency.setValueAtTime(150 + Math.random() * 40, burstTime);
        boomOsc.frequency.exponentialRampToValueAtTime(25, burstTime + 0.38);
        boomGain.gain.setValueAtTime(0.85, burstTime);
        boomGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.4);
        boomOsc.connect(boomGain);
        boomGain.connect(this.getTarget());
        boomOsc.start(burstTime);
        boomOsc.stop(boomGain ? burstTime + 0.42 : burstTime + 0.4);

        // 3. Noise shockwave blast
        const bufferSize = ctx.sampleRate * 0.35;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650 + Math.random() * 300, burstTime);
        filter.Q.setValueAtTime(1.2, burstTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.70, burstTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.35);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.getTarget());
        noise.start(burstTime);
        noise.stop(burstTime + 0.35);

        // 4. Sparkle crackles / firecrackers pops
        for (let c = 0; c < 8; c++) {
          const crackleTime = burstTime + 0.08 + c * 0.035 + Math.random() * 0.03;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'square';
          popOsc.frequency.setValueAtTime(950 + Math.random() * 1200, crackleTime);
          popGain.gain.setValueAtTime(0.35, crackleTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.025);
          popOsc.connect(popGain);
          popGain.connect(this.getTarget());
          popOsc.start(crackleTime);
          popOsc.stop(crackleTime + 0.03);
        }
      });
    } catch {}
  }

  // Realistic Crowd Clapping & Applause Synthesizer (হাত তালির শব্দ - MUCH LOUDER)
  public playApplause() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const duration = 2.8;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const applauseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = applauseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      // Swelling crowd cheering background (Boosted from 0.14 to 0.50)
      const cheerSource = ctx.createBufferSource();
      cheerSource.buffer = applauseBuffer;
      const cheerFilter = ctx.createBiquadFilter();
      cheerFilter.type = 'bandpass';
      cheerFilter.frequency.setValueAtTime(900, t);
      cheerFilter.Q.setValueAtTime(1.5, t);

      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0.01, t);
      cheerGain.gain.linearRampToValueAtTime(0.50, t + 0.6);
      cheerGain.gain.linearRampToValueAtTime(0.42, t + 2.0);
      cheerGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      cheerSource.connect(cheerFilter);
      cheerFilter.connect(cheerGain);
      cheerGain.connect(this.getTarget());
      cheerSource.start(t);
      cheerSource.stop(t + duration);

      // Overlapping individual hand claps (Boosted from 0.08..0.12 to 0.40..0.55)
      for (let i = 0; i < 45; i++) {
        const clapTime = t + Math.random() * (duration - 0.3);
        const clapGain = ctx.createGain();
        const clapFilter = ctx.createBiquadFilter();

        clapFilter.type = 'bandpass';
        clapFilter.frequency.setValueAtTime(1200 + Math.random() * 1400, clapTime);
        clapFilter.Q.setValueAtTime(3.0, clapTime);

        const clapVol = 0.35 + Math.random() * 0.20;
        clapGain.gain.setValueAtTime(clapVol, clapTime);
        clapGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04);

        const singleClap = ctx.createBufferSource();
        singleClap.buffer = applauseBuffer;
        singleClap.connect(clapFilter);
        clapFilter.connect(clapGain);
        clapGain.connect(this.getTarget());
        singleClap.start(clapTime);
        singleClap.stop(clapTime + 0.05);
      }
    } catch {}
  }

  // Combined Celebration: Fanfare + Fireworks + Applause
  public playCelebration() {
    this.stopBgm();
    this.playVictory();
    this.playFireworks();
    this.playApplause();
  }

  // Match victory fanfare (MUCH LOUDER)
  public playVictory() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99],          // C Major
        [587.33, 739.99, 880.00],          // D Major
        [659.25, 830.61, 987.77],          // E Major
        [783.99, 987.77, 1046.50, 1318.51] // C6 grand finish
      ];

      chords.forEach((chord, chordIdx) => {
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + chordIdx * 0.16);

          // Boosted from 0.15 to 0.60
          gain.gain.setValueAtTime(0.60, t + chordIdx * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, t + chordIdx * 0.16 + 0.45);

          osc.connect(gain);
          gain.connect(this.getTarget());

          osc.start(t + chordIdx * 0.16);
          osc.stop(t + chordIdx * 0.16 + 0.5);
        });
      });
    } catch {}
  }

  // Intro splash screen chime (MUCH LOUDER)
  public playIntroChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      arpeggio.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.09);
        // Boosted from 0.12 to 0.55
        gain.gain.setValueAtTime(0.55, t + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.55);
        osc.connect(gain);
        gain.connect(this.getTarget());
        osc.start(t + i * 0.09);
        osc.stop(t + i * 0.09 + 0.6);
      });
    } catch {}
  }

  // App open intro sound - voice announcement disabled per user request
  public playVoiceIntro() {
    // Spoken voice "Ps Ludo Master" disabled per user request
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    // Only play gentle chime if sound is enabled
    this.playIntroChime();
  }
}

export const sounds = new SoundManager();
