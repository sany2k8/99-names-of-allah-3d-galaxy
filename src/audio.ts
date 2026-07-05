class AudioEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlayingDrone = false;
  private volume = 0.4;
  private analyser: AnalyserNode | null = null;
  public vocalAudio: HTMLAudioElement | null = null;
  private vocalSource: MediaElementAudioSourceNode | null = null;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    
    // Initialize Real-time Analyser for Audio-Reactive Stars and Galaxies
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64; // Small size for responsive, organic pulsing
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public getAudioLevel(): number {
    if (!this.ctx || !this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length / 255; // Normalize to 0.0 - 1.0 range
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public playAmbientDrone(theme: string = 'slate') {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Smooth transition if theme changes while already playing
    if (this.isPlayingDrone) {
      if ((this as any).currentTheme === theme) return;
      
      // Stop old active oscillators
      this.oscillators.forEach(item => {
        try { item.osc.stop(); } catch (e) {}
      });
      this.oscillators = [];
      if (this.droneGain) {
        try { this.droneGain.disconnect(); } catch (e) {}
      }
      this.isPlayingDrone = false;
    }

    (this as any).currentTheme = theme;

    const now = this.ctx.currentTime;
    this.droneGain = this.ctx.createGain();
    // Fade in
    this.droneGain.gain.setValueAtTime(0, now);
    this.droneGain.gain.linearRampToValueAtTime(0.35, now + 4);
    this.droneGain.connect(this.masterGain!);

    // Design distinct ambient signatures for each Celestial Architecture selection
    let baseFreqs = [72.8, 109.2, 145.6, 218.4]; // Cosmic Slate
    let waveTypes: OscillatorType[] = ['sine', 'triangle', 'sine', 'triangle'];
    let filterFreq = 320;
    let filterQ = 1.5;
    let lfoRateBase = 0.08;
    let lfoGainVal = 0.08;

    if (theme === 'gold') { // Sacred Gold
      baseFreqs = [144.0, 216.0, 288.0, 432.0]; // Warm 432Hz desert tuning
      waveTypes = ['sine', 'sine', 'triangle', 'sine'];
      filterFreq = 400;
      filterQ = 1.2;
      lfoRateBase = 0.06;
      lfoGainVal = 0.06;
    } else if (theme === 'emerald') { // Mystic Emerald
      baseFreqs = [96.0, 144.0, 192.0, 288.0]; // Deep organic oasis wind
      waveTypes = ['sine', 'sine', 'sine', 'sine'];
      filterFreq = 350;
      filterQ = 3.0; // Airy resonant wind
      lfoRateBase = 0.05;
      lfoGainVal = 0.1;
    } else if (theme === 'rose') { // Rose Quartz
      baseFreqs = [85.0, 127.5, 170.0, 255.0]; // Dreamy fuchsia evening sky
      waveTypes = ['triangle', 'triangle', 'sine', 'sine'];
      filterFreq = 280;
      filterQ = 1.0;
      lfoRateBase = 0.04;
      lfoGainVal = 0.07;
    } else if (theme === 'ruby') { // Royal Ruby
      baseFreqs = [65.4, 98.1, 130.8, 196.2]; // Contemplative deep crimson flame
      waveTypes = ['triangle', 'triangle', 'triangle', 'sine'];
      filterFreq = 180;
      filterQ = 2.0;
      lfoRateBase = 0.07;
      lfoGainVal = 0.08;
    } else if (theme === 'nebula') { // Deep Nebula
      baseFreqs = [110.0, 165.0, 220.0, 330.0]; // Ethereal cyberpunk spacer
      waveTypes = ['sine', 'triangle', 'sine', 'sine'];
      filterFreq = 480;
      filterQ = 1.8;
      lfoRateBase = 0.12; // slightly more shimmering wave speed
      lfoGainVal = 0.09;
    } else if (theme === 'sapphire') { // Sapphire Blue
      baseFreqs = [82.4, 123.6, 164.8, 247.2]; // Oceanic deep blue tuning
      waveTypes = ['sine', 'triangle', 'sine', 'sine'];
      filterFreq = 300;
      filterQ = 2.0;
      lfoRateBase = 0.06;
      lfoGainVal = 0.08;
    } else if (theme === 'amber') { // Sunset Amber
      baseFreqs = [116.5, 174.8, 233.1, 349.6]; // Warm resonance
      waveTypes = ['sine', 'sine', 'triangle', 'sine'];
      filterFreq = 380;
      filterQ = 1.3;
      lfoRateBase = 0.05;
      lfoGainVal = 0.07;
    } else if (theme === 'amethyst') { // Purple Amethyst
      baseFreqs = [103.8, 155.7, 207.6, 311.3]; // Spiritual velvet drone
      waveTypes = ['sine', 'triangle', 'sine', 'triangle'];
      filterFreq = 420;
      filterQ = 1.6;
      lfoRateBase = 0.08;
      lfoGainVal = 0.08;
    }

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();
      
      osc.type = waveTypes[idx % waveTypes.length];
      osc.frequency.setValueAtTime(freq, now);
      
      // Detune slightly for an organic, lush chorus effect
      osc.detune.setValueAtTime((idx - 1.5) * 6, now);

      // Low frequency modulation (LFO) for wave-like breathing effect
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(lfoRateBase + idx * 0.03, now); // ultra slow LFO
      lfoGain.gain.setValueAtTime(lfoGainVal, now);
      
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      
      gainNode.gain.setValueAtTime(0.12, now);
      
      // Lowpass filter to keep it dark and warm
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq - idx * 40, now);
      filter.Q.setValueAtTime(filterQ, now);

      osc.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(this.droneGain!);
      
      osc.start(now);
      lfo.start(now);
      
      this.oscillators.push({ osc, gain: gainNode });
    });

    this.isPlayingDrone = true;
  }

  public stopAmbientDrone() {
    if (!this.ctx || !this.isPlayingDrone) return;
    const now = this.ctx.currentTime;
    
    if (this.droneGain) {
      try {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.linearRampToValueAtTime(0, now + 1.5);
        setTimeout(() => {
          this.oscillators.forEach(item => {
            try { item.osc.stop(); } catch (e) {}
          });
          this.oscillators = [];
          this.isPlayingDrone = false;
        }, 1600);
      } catch (e) {
        this.isPlayingDrone = false;
      }
    } else {
      this.isPlayingDrone = false;
    }
  }

  public playSparkle(type: 'hover' | 'click' | 'complete' | 'favorite' = 'hover') {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Create synthesizer parameters based on interaction type
    let freqs = [523.25, 659.25, 783.99]; // Major triad C5 - E5 - G5
    let duration = 0.8;
    let typeOsc: OscillatorType = 'sine';
    let detuneRange = 0;

    if (type === 'hover') {
      freqs = [659.25, 880.00]; // Warm interval
      duration = 0.5;
      typeOsc = 'sine';
    } else if (type === 'click') {
      freqs = [523.25, 659.25, 783.99, 987.77]; // Maj7 chord
      duration = 1.2;
      typeOsc = 'sine';
      detuneRange = 4;
    } else if (type === 'complete') {
      freqs = [523.25, 659.25, 783.99, 1046.50]; // Octave resolution
      duration = 1.5;
      typeOsc = 'triangle';
    } else if (type === 'favorite') {
      freqs = [587.33, 739.99, 880.00, 1174.66]; // Golden D major chord
      duration = 1.4;
      typeOsc = 'sine';
    }

    const mixGain = this.ctx.createGain();
    mixGain.gain.setValueAtTime(0, now);
    mixGain.gain.linearRampToValueAtTime(type === 'click' ? 0.25 : 0.15, now + 0.05);
    mixGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    mixGain.connect(this.masterGain!);

    // Soft delay effect
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.18, now);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.4, now);
    
    mixGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.masterGain!);

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = typeOsc;
      osc.frequency.setValueAtTime(freq, now);
      if (detuneRange > 0) {
        osc.detune.setValueAtTime((idx - 1) * detuneRange, now);
      }
      
      osc.connect(mixGain);
      osc.start(now);
      osc.stop(now + duration + 0.5);
    });
  }

  public playNameAudio(transliteration: string, nameAr: string, id: number, style: 'studio' | 'celestial' = 'celestial') {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // Stop any currently playing studio vocal
    if (this.vocalAudio) {
      try {
        this.vocalAudio.pause();
        this.vocalAudio.currentTime = 0;
      } catch (e) {}
    }

    if (style === 'studio') {
      // Create audio element if not already existing
      if (!this.vocalAudio) {
        this.vocalAudio = new Audio();
        this.vocalAudio.crossOrigin = "anonymous";
      }

      // We use the verified GitHub CDN raw url
      this.vocalAudio.src = `https://raw.githubusercontent.com/hasanm/99-names-of-allah-audio/master/audio/${id}.mp3`;

      // Connect vocalAudio to MasterGain so it goes through Analyser Node for Audio-Reactive stars
      if (!this.vocalSource && this.ctx && this.masterGain) {
        try {
          this.vocalSource = this.ctx.createMediaElementSource(this.vocalAudio);
          this.vocalSource.connect(this.masterGain);
        } catch (err) {
          console.warn("MediaElementAudioSourceNode creation failed:", err);
        }
      }

      this.vocalAudio.play().catch(err => {
        console.warn("Studio vocal failed, falling back to Celestial Chanting:", err);
        // Failover fallback to Celestial style
        this.playNameAudio(transliteration, nameAr, id, 'celestial');
      });
    } else {
      // 1. Celestial sacred chime arpeggio based on name ID
      const solfeggio = [396.0, 417.0, 528.0, 639.0, 741.0, 852.0, 963.0, 1056.0, 1278.0];
      const note1 = solfeggio[id % solfeggio.length];
      const note2 = solfeggio[(id + 2) % solfeggio.length];
      const note3 = solfeggio[(id + 4) % solfeggio.length];
      const melody = [note1, note2, note3];
      const delayStep = 0.24;

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      chimeGain.connect(this.masterGain!);

      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.32, now);
      const delayFeedback = this.ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.42, now);
      
      chimeGain.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delayFeedback.connect(this.masterGain!);

      melody.forEach((freq, idx) => {
        if (!this.ctx) return;
        const oscTime = now + idx * delayStep;
        
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, oscTime);
        
        oscGain.gain.setValueAtTime(0, oscTime);
        oscGain.gain.linearRampToValueAtTime(0.15, oscTime + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.001, oscTime + 1.2);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, oscTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        filter.connect(chimeGain);
        
        osc.start(oscTime);
        osc.stop(oscTime + 2.0);
      });

      // 2. Pronounce Arabic name using client-side SpeechSynthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(nameAr);
          utterance.lang = 'ar-SA';
          utterance.rate = 0.72; // slow and clear
          utterance.pitch = 0.92; // deep, contemplative
          
          // Find best Arabic voice
          const voices = window.speechSynthesis.getVoices();
          const arVoice = voices.find(v => v.lang.startsWith('ar'));
          if (arVoice) {
            utterance.voice = arVoice;
          }
          
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 300);
        } catch (err) {
          console.warn('Speech synthesis failed:', err);
        }
      }
    }
  }
}

export const audio = new AudioEngine();
