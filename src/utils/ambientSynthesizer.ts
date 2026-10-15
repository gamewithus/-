import { AmbientSoundType } from '../types';

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private volumeGain: GainNode | null = null;
  private currentTrack: AmbientSoundType = 'none';
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private isDucked: boolean = false;

  // Active oscillator / node references for cleanup
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private activeIntervals: number[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.duckingGain = this.ctx.createGain();
      this.volumeGain = this.ctx.createGain();

      this.volumeGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.volumeGain.connect(this.duckingGain);
      this.duckingGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volumeGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.volumeGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.volumeGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.volumeGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setDucking(duck: boolean) {
    this.isDucked = duck;
    if (this.duckingGain && this.ctx) {
      // Auto-ducking: drops ambient to 20% when voice reads
      const target = duck ? 0.20 : 1.0;
      const rampTime = duck ? 0.35 : 0.65;
      this.duckingGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.duckingGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + rampTime);
    }
  }

  public stop() {
    this.activeIntervals.forEach(id => window.clearInterval(id));
    this.activeIntervals = [];

    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
  }

  public getCurrentTrack(): AmbientSoundType {
    return this.currentTrack;
  }

  public playTrack(track: AmbientSoundType) {
    this.initContext();
    if (!this.ctx || !this.volumeGain) return;

    if (this.currentTrack === track && track !== 'none') {
      return; // Already playing
    }

    this.stop();
    this.currentTrack = track;

    if (track === 'none') return;

    switch (track) {
      case 'flute':
        this.startFluteSynthesis();
        break;
      case 'wind':
        this.startWindSynthesis();
        break;
      case 'river':
        this.startRiverSynthesis();
        break;
      case 'tanpura':
        this.startTanpuraSynthesis();
        break;
      case 'drums':
        this.startDrumsSynthesis();
        break;
    }
  }

  // --- 1. Melancholic Bamboo Flute (Bansuri - Raag Darbari / Bhairavi mood) ---
  private startFluteSynthesis() {
    if (!this.ctx || !this.volumeGain) return;
    const ctx = this.ctx;

    // Gentle white noise for breath sound
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1600;
    noiseFilter.Q.value = 4;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.035;

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.volumeGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise);

    // Flute melodic phrasing (Indian scale: Re, Ga Komal, Ma, Dha Komal, Ni Komal)
    // C# minor / Bhairavi scale: C#4, D4, E4, F#4, G#4, A4, B4, C#5
    const notes = [277.18, 293.66, 329.63, 369.99, 415.30, 440.0, 493.88, 554.37];
    // Phrase patterns (indexes)
    const melodyPhrases = [
      [0, 1, 2, 4, 2, 1, 0],
      [4, 5, 4, 2, 1, 0, 1],
      [2, 4, 6, 7, 6, 4, 2],
      [1, 2, 1, 0, 1, 0]
    ];

    let phraseIdx = 0;
    let noteIdx = 0;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';

    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 4.8; // 4.8 Hz vibrato
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 4.0; // +/- 4 Hz depth
    vibrato.connect(osc.frequency);
    vibrato.start();

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, ctx.currentTime);

    const fluteFilter = ctx.createBiquadFilter();
    fluteFilter.type = 'lowpass';
    fluteFilter.frequency.value = 1200;

    osc.connect(fluteFilter);
    fluteFilter.connect(noteGain);
    noteGain.connect(this.volumeGain);

    osc.start();
    this.activeNodes.push(osc, vibrato);

    const playNextNote = () => {
      if (!this.ctx || this.currentTrack !== 'flute') return;
      const currentPhrase = melodyPhrases[phraseIdx % melodyPhrases.length];
      const freq = notes[currentPhrase[noteIdx % currentPhrase.length]];

      const now = ctx.currentTime;
      osc.frequency.setTargetAtTime(freq, now, 0.08);

      // Breath envelope for flute note
      noteGain.gain.cancelScheduledValues(now);
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

      noteIdx++;
      if (noteIdx >= currentPhrase.length) {
        noteIdx = 0;
        phraseIdx++;
      }
    };

    playNextNote();
    const interval = window.setInterval(playNextNote, 2300);
    this.activeIntervals.push(interval);
  }

  // --- 2. Mountain Wind (ওয়াজিরিস্তান ও নির্জন পাহাড়ের গিরিবাতাস) ---
  private startWindSynthesis() {
    if (!this.ctx || !this.volumeGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Resonant bandpass filter sweeping slowly
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 320;
    filter.Q.value = 4.5;

    // LFO for howling gusts
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.14; // slow cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220; // sweeps between 100Hz and 540Hz
    lfo.connect(filter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.28;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.volumeGain);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, lfo);
  }

  // --- 3. River Waves & Ripples (ঝিলম নদীর শান্ত কলতান) ---
  private startRiverSynthesis() {
    if (!this.ctx || !this.volumeGain) return;
    const ctx = this.ctx;

    // Noise buffer for water flow
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Low rumble / surge
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.value = 350;

    // High ripple sparkle
    const sparkleFilter = ctx.createBiquadFilter();
    sparkleFilter.type = 'bandpass';
    sparkleFilter.frequency.value = 1400;
    sparkleFilter.Q.value = 3;

    // LFO for wave surging
    const surgeLfo = ctx.createOscillator();
    surgeLfo.frequency.value = 0.22; // ~4.5 sec wave period
    const surgeGain = ctx.createGain();
    surgeGain.gain.value = 0.08;

    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.22;

    noise.connect(lowFilter);
    noise.connect(sparkleFilter);
    lowFilter.connect(waterGain);
    sparkleFilter.connect(waterGain);

    surgeLfo.connect(waterGain.gain);
    waterGain.connect(this.volumeGain);

    noise.start();
    surgeLfo.start();
    this.activeNodes.push(noise, surgeLfo);
  }

  // --- 4. Classical Tanpura Drone (Sa-Pa-Sa-Sa drone) ---
  private startTanpuraSynthesis() {
    if (!this.ctx || !this.volumeGain) return;
    const ctx = this.ctx;

    // Classical Tanpura Tuning: Pa (G2/G3), Sa (C3), Sa (C3), Sa Kharaj (C2)
    // Pitch reference: C3 = 130.81Hz, Pa = 196.00Hz, Sa high = 261.63Hz
    const strings = [
      { freq: 196.00, desc: 'Pa' },
      { freq: 261.63, desc: 'Sa' },
      { freq: 261.63, desc: 'Sa' },
      { freq: 130.81, desc: 'Kharaj Sa' }
    ];

    let currentString = 0;

    const pluckString = () => {
      if (!this.ctx || this.currentTrack !== 'tanpura') return;
      const str = strings[currentString % strings.length];
      const now = ctx.currentTime;

      // Primary tone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(str.freq, now);

      // Subtle detuned shimmer oscillator for the jawari (buzz)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(str.freq * 2.01, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 3.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.volumeGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 4.0);
      osc2.stop(now + 4.0);

      currentString++;
    };

    pluckString();
    const interval = window.setInterval(pluckString, 1100);
    this.activeIntervals.push(interval);
  }

  // --- 5. Desert War Drums & Somber Elegy (মাদল ও অন্তিম শোকগাথা) ---
  private startDrumsSynthesis() {
    if (!this.ctx || !this.volumeGain) return;
    const ctx = this.ctx;

    // Continuous mournful cello/pad drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.value = 65.41; // C2

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 180;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.06;

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.volumeGain);

    droneOsc.start();
    this.activeNodes.push(droneOsc);

    // Solemn war drum heartbeat (beat every 1.8s)
    let beatCount = 0;
    const hitDrum = () => {
      if (!this.ctx || this.currentTrack !== 'drums') return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      // Pitch drop envelope typical of heavy membrane drums
      osc.frequency.setValueAtTime(beatCount % 2 === 0 ? 80 : 65, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      const drumGain = ctx.createGain();
      drumGain.gain.setValueAtTime(0.24, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(drumGain);
      drumGain.connect(this.volumeGain!);

      osc.start(now);
      osc.stop(now + 1.0);

      beatCount++;
    };

    hitDrum();
    const interval = window.setInterval(hitDrum, 1800);
    this.activeIntervals.push(interval);
  }
}

export const ambientSynth = new AmbientSynthesizer();
