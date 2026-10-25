// Web Audio API Synthesizer for high-fidelity Ludo game audio

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Button click
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

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext might be blocked before first user gesture
    }
  }

  // Dice shake & roll
  public playDiceRoll() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Synthesize wooden tumbling rattles
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'triangle' : 'square';
        const startFreq = 180 + Math.random() * 220;
        osc.frequency.setValueAtTime(startFreq, t + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(80, t + i * 0.06 + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t + i * 0.06);

        gain.gain.setValueAtTime(0.15, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.05);
      }
    } catch {}
  }

  // Token hopping on board with ascending pitch per step counted
  public playStepHop(stepNum: number = 1, totalSteps: number = 6) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 320 + Math.min(stepNum, 6) * 40;
      const endFreq = startFreq + 140;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.09);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  public playTokenHop() {
    this.playStepHop(1, 1);
  }

  // Token safe zone chime
  public playSafeChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.12, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.25);
      });
    } catch {}
  }

  // Knockout capture smash sound
  public playCaptureSmash() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Low impact thump + high slice chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  // Token reaches home (Center goal)
  public playHomeFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.18, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.35);
      });
    } catch {}
  }

  // Realistic Firecracker & Fireworks Sound Synthesizer (বাজি ফাটার শব্দ)
  public playFireworks() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;

      // 4 distinct fireworks bursts with staggered timing
      const burstDelays = [0.05, 0.45, 0.95, 1.5];

      burstDelays.forEach((delay) => {
        const burstTime = t + delay;

        // 1. Rocket whistle ascent
        const whistle = ctx.createOscillator();
        const whistleGain = ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(400 + Math.random() * 200, burstTime - 0.2);
        whistle.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 400, burstTime);
        whistleGain.gain.setValueAtTime(0.04, burstTime - 0.2);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, burstTime);
        whistle.connect(whistleGain);
        whistleGain.connect(ctx.destination);
        whistle.start(burstTime - 0.2);
        whistle.stop(burstTime);

        // 2. Heavy explosion BOOM (Low-end thump)
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.type = 'triangle';
        boomOsc.frequency.setValueAtTime(140 + Math.random() * 40, burstTime);
        boomOsc.frequency.exponentialRampToValueAtTime(25, burstTime + 0.35);
        boomGain.gain.setValueAtTime(0.35, burstTime);
        boomGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.38);
        boomOsc.connect(boomGain);
        boomGain.connect(ctx.destination);
        boomOsc.start(burstTime);
        boomOsc.stop(burstTime + 0.4);

        // 3. Noise shockwave blast
        const bufferSize = ctx.sampleRate * 0.3;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600 + Math.random() * 300, burstTime);
        filter.Q.setValueAtTime(1.2, burstTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, burstTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.3);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(burstTime);
        noise.stop(burstTime + 0.3);

        // 4. Sparkle crackles / firecrackers pops right after explosion
        for (let c = 0; c < 8; c++) {
          const crackleTime = burstTime + 0.08 + c * 0.035 + Math.random() * 0.03;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'square';
          popOsc.frequency.setValueAtTime(900 + Math.random() * 1200, crackleTime);
          popGain.gain.setValueAtTime(0.12, crackleTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.025);
          popOsc.connect(popGain);
          popGain.connect(ctx.destination);
          popOsc.start(crackleTime);
          popOsc.stop(crackleTime + 0.03);
        }
      });
    } catch {}
  }

  // Realistic Crowd Clapping & Applause Synthesizer (হাত তালির শব্দ)
  public playApplause() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const duration = 2.8;

      // Generate a continuous noise buffer for clapping synthesis
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const applauseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = applauseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      // Swelling crowd cheering background
      const cheerSource = ctx.createBufferSource();
      cheerSource.buffer = applauseBuffer;
      const cheerFilter = ctx.createBiquadFilter();
      cheerFilter.type = 'bandpass';
      cheerFilter.frequency.setValueAtTime(900, t);
      cheerFilter.Q.setValueAtTime(1.5, t);

      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0.01, t);
      cheerGain.gain.linearRampToValueAtTime(0.14, t + 0.6);
      cheerGain.gain.linearRampToValueAtTime(0.12, t + 2.0);
      cheerGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      cheerSource.connect(cheerFilter);
      cheerFilter.connect(cheerGain);
      cheerGain.connect(ctx.destination);
      cheerSource.start(t);
      cheerSource.stop(t + duration);

      // Overlapping individual hand claps (40 fast micro-bursts)
      for (let i = 0; i < 45; i++) {
        const clapTime = t + Math.random() * (duration - 0.3);
        const clapGain = ctx.createGain();
        const clapFilter = ctx.createBiquadFilter();

        clapFilter.type = 'bandpass';
        clapFilter.frequency.setValueAtTime(1200 + Math.random() * 1400, clapTime);
        clapFilter.Q.setValueAtTime(3.0, clapTime);

        const clapVol = 0.08 + Math.random() * 0.12;
        clapGain.gain.setValueAtTime(clapVol, clapTime);
        clapGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04);

        const singleClap = ctx.createBufferSource();
        singleClap.buffer = applauseBuffer;
        singleClap.connect(clapFilter);
        clapFilter.connect(clapGain);
        clapGain.connect(ctx.destination);
        singleClap.start(clapTime);
        singleClap.stop(clapTime + 0.05);
      }
    } catch {}
  }

  // Combined Celebration: Fanfare + Fireworks + Applause
  public playCelebration() {
    this.playVictory();
    this.playFireworks();
    this.playApplause();
  }

  // Match victory fanfare
  public playVictory() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99],       // C Major
        [587.33, 739.99, 880.00],       // D Major
        [659.25, 830.61, 987.77],       // E Major
        [783.99, 987.77, 1046.50, 1318.51] // C6 grand finish
      ];

      chords.forEach((chord, chordIdx) => {
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + chordIdx * 0.16);

          gain.gain.setValueAtTime(0.15, t + chordIdx * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, t + chordIdx * 0.16 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(t + chordIdx * 0.16);
          osc.stop(t + chordIdx * 0.16 + 0.45);
        });
      });
    } catch {}
  }

  // Intro splash screen chime
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
        gain.gain.setValueAtTime(0.12, t + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.09);
        osc.stop(t + i * 0.09 + 0.55);
      });
    } catch {}
  }
}

export const sounds = new SoundManager();
