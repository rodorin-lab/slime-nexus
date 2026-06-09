class AudioManager {
  private audioContext: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private seGain: GainNode | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.bgmGain = this.audioContext.createGain();
      this.seGain = this.audioContext.createGain();
      this.bgmGain.connect(this.audioContext.destination);
      this.seGain.connect(this.audioContext.destination);
      this.bgmGain.gain.value = 0.3;
      this.seGain.gain.value = 0.5;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playBGM(frequency: number = 110, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.bgmGain) return;
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    osc.connect(this.bgmGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 60);
  }

  playSE(frequency: number = 440, type: OscillatorType = 'square', duration: number = 0.2): void {
    if (!this.audioContext || !this.seGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.seGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playFeed(): void {
    this.playSE(600, 'sine', 0.1);
    setTimeout(() => this.playSE(800, 'sine', 0.1), 100);
  }

  playTrain(): void {
    this.playSE(200, 'sawtooth', 0.3);
  }

  playRest(): void {
    this.playSE(300, 'sine', 0.5);
  }

  playEvolve(): void {
    [400, 500, 600, 800].forEach((freq, i) => {
      setTimeout(() => this.playSE(freq, 'square', 0.2), i * 150);
    });
  }

  playBattleStart(): void {
    this.playSE(440, 'square', 0.1);
    setTimeout(() => this.playSE(880, 'square', 0.3), 100);
  }
}

export const audioManager = new AudioManager();
