// Enhanced 8-bit Sound Manager with context-specific music
// Generates retro chiptune sounds and melodies procedurally

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.musicPlaying = false;
    this.musicTimeout = null;
    this.musicTimeouts = [];
    this.enabled = true;
    this.musicEnabled = true;
    this.currentTrack = null;
    this.currentLevel = 1;
    this.volume = {
      music: 0.7,
      effects: 1.0,
      ui: 0.8
    };
  }

  init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      // Web Audio API not available — sound disabled silently
    }
  }

  playTone(frequency, duration, type = 'square', volume = 0.12, delay = 0) {
    if (!this.enabled || !this.audioContext) return;
    const startTime = this.audioContext.currentTime + delay;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playClick() {
    this.init();
    this.playTone(800, 0.04, 'square', 0.08);
    this.playTone(1000, 0.03, 'square', 0.05, 0.02);
  }

  playSuccess() {
    this.init();
    [523, 659, 784, 1047].forEach((freq, i) => {
      this.playTone(freq, 0.12, 'square', 0.1, i * 0.08);
    });
  }

  playCrack() {
    this.init();
    this.playTone(120, 0.06, 'sawtooth', 0.25);
    this.playTone(80, 0.04, 'square', 0.2, 0.02);
    this.playTone(200, 0.03, 'sawtooth', 0.15, 0.04);
    this.playTone(150, 0.05, 'square', 0.1, 0.05);
    this.playTone(400, 0.02, 'sine', 0.12, 0.06);
  }

  playMuscleRelease() {
    this.init();
    this.playTone(250, 0.15, 'sine', 0.08);
    this.playTone(350, 0.12, 'sine', 0.06, 0.08);
    this.playTone(500, 0.1, 'triangle', 0.05, 0.15);
  }

  playToolActivator() {
    this.init();
    this.playTone(1200, 0.02, 'square', 0.15);
    this.playTone(800, 0.02, 'square', 0.12, 0.03);
    this.playTone(1500, 0.03, 'square', 0.1, 0.05);
  }

  playToolMassageGun() {
    this.init();
    [0, 0.06, 0.12, 0.18].forEach(d => {
      this.playTone(100 + Math.random() * 50, 0.04, 'sawtooth', 0.08, d);
    });
  }

  playToolUltrasound() {
    this.init();
    this.playTone(2000, 0.3, 'sine', 0.04);
    this.playTone(2100, 0.3, 'sine', 0.03, 0.05);
  }

  playToolTens() {
    this.init();
    [0, 0.05, 0.1, 0.15, 0.2].forEach(d => {
      this.playTone(600 + Math.random() * 400, 0.03, 'sawtooth', 0.06, d);
    });
  }

  playMoney() {
    this.init();
    [988, 1319, 988, 1568, 1760].forEach((freq, i) => {
      this.playTone(freq, 0.08, 'square', 0.08, i * 0.06);
    });
  }

  playPatientEnter() {
    this.init();
    [523, 659, 784].forEach((freq, i) => {
      this.playTone(freq, 0.15, 'triangle', 0.08, i * 0.1);
    });
  }

  playPatientHappy() {
    this.init();
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      this.playTone(freq, 0.1, 'square', 0.08, i * 0.08);
    });
  }

  playPatientOuch() {
    this.init();
    this.playTone(300, 0.15, 'sawtooth', 0.1);
    this.playTone(200, 0.2, 'sawtooth', 0.08, 0.1);
  }

  playRefer() {
    this.init();
    [440, 349, 262, 220].forEach((freq, i) => {
      this.playTone(freq, 0.15, 'triangle', 0.08, i * 0.12);
    });
  }

  playError() {
    this.init();
    this.playTone(200, 0.2, 'square', 0.1);
    this.playTone(150, 0.3, 'square', 0.1, 0.15);
  }

  playLevelUp() {
    this.init();
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.1, 'square', 0.1, i * 0.06);
    });
  }

  playWrongZone() {
    this.init();
    this.playTone(150, 0.15, 'sawtooth', 0.12);
    this.playTone(120, 0.2, 'square', 0.1, 0.1);
  }

  playCASpeak() {
    this.init();
    const blips = [400, 500, 450, 550, 400];
    blips.forEach((freq, i) => {
      this.playTone(freq, 0.04, 'square', 0.06, i * 0.06);
    });
  }

  playBookingNotification() {
    this.init();
    this.playTone(880, 0.08, 'sine', 0.08);
    this.playTone(1100, 0.08, 'sine', 0.06, 0.1);
    this.playTone(880, 0.08, 'sine', 0.04, 0.2);
  }

  playWhatsApp() {
    this.init();
    this.playTone(660, 0.06, 'sine', 0.1);
    this.playTone(880, 0.1, 'sine', 0.08, 0.08);
  }

  playHeartbeat() {
    this.init();
    const vol = this.volume.effects;
    this.playTone(80, 0.08, 'sine', 0.15 * vol);
    this.playTone(60, 0.12, 'sine', 0.1 * vol, 0.08);
    this.playTone(80, 0.06, 'sine', 0.12 * vol, 0.2);
    this.playTone(60, 0.1, 'sine', 0.08 * vol, 0.28);
  }

  playFootsteps() {
    this.init();
    const vol = this.volume.effects;
    for (let i = 0; i < 4; i++) {
      this.playTone(100 + Math.random() * 40, 0.08, 'square', 0.06 * vol, i * 0.2);
      this.playTone(60, 0.05, 'sawtooth', 0.04 * vol, i * 0.2 + 0.02);
    }
  }

  playDoor() {
    this.init();
    const vol = this.volume.effects;
    this.playTone(150, 0.1, 'triangle', 0.08 * vol);
    this.playTone(100, 0.15, 'square', 0.06 * vol, 0.05);
    this.playTone(80, 0.2, 'sawtooth', 0.04 * vol, 0.1);
  }

  playCashRegister() {
    this.init();
    const vol = this.volume.effects;
    this.playTone(800, 0.05, 'square', 0.1 * vol);
    this.playTone(1000, 0.05, 'square', 0.08 * vol, 0.03);
    this.playTone(1200, 0.1, 'square', 0.06 * vol, 0.08);
  }

  playPhoneRing() {
    this.init();
    const vol = this.volume.effects;
    [0, 0.3, 0.6, 0.9].forEach(d => {
      this.playTone(880, 0.1, 'square', 0.1 * vol, d);
      this.playTone(1100, 0.1, 'square', 0.08 * vol, d + 0.05);
    });
  }

  playMachinery() {
    this.init();
    const vol = this.volume.effects;
    for (let i = 0; i < 8; i++) {
      this.playTone(200 + Math.random() * 100, 0.04, 'sawtooth', 0.05 * vol, i * 0.1);
    }
    this.playTone(150, 0.3, 'square', 0.03 * vol, 0.4);
  }

  playCrowd() {
    this.init();
    const vol = this.volume.effects;
    for (let i = 0; i < 10; i++) {
      this.playTone(300 + Math.random() * 200, 0.08, 'sawtooth', 0.03 * vol, i * 0.12);
    }
    this.playTone(100, 0.4, 'triangle', 0.04 * vol, 0.5);
  }

  playBreathing() {
    this.init();
    const vol = this.volume.effects;
    for (let i = 0; i < 3; i++) {
      this.playTone(200 + i * 20, 0.3, 'sine', 0.06 * vol, i * 0.5);
      this.playTone(180 + i * 15, 0.25, 'sine', 0.04 * vol, i * 0.5 + 0.35);
    }
  }

  playAchievementUnlock() {
    this.init();
    const vol = this.volume.effects;
    [523, 659, 784, 988, 1175, 1319, 1568].forEach((freq, i) => {
      this.playTone(freq, 0.15, 'square', 0.08 * vol, i * 0.1);
      this.playTone(freq / 2, 0.15, 'triangle', 0.04 * vol, i * 0.1);
    });
  }

  playCombo() {
    this.init();
    const vol = this.volume.effects;
    [440, 554, 659, 880, 1047].forEach((freq, i) => {
      this.playTone(freq, 0.08, 'square', 0.1 * vol, i * 0.06);
    });
  }

  // --- MUSIC TRACKS ---
  stopMusic() {
    this.musicPlaying = false;
    this.currentTrack = null;
    this.musicTimeouts.forEach(t => clearTimeout(t));
    this.musicTimeouts = [];
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  _scheduleNote(callback, delayMs) {
    const tid = setTimeout(callback, delayMs);
    this.musicTimeouts.push(tid);
    return tid;
  }

  playMenuMusic() {
    if (!this.musicEnabled || this.currentTrack === 'menu') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'menu';

    const melody = [
      { n: 330, d: 0.2 }, { n: 330, d: 0.1 }, { n: 392, d: 0.2 }, { n: 440, d: 0.4 },
      { n: 392, d: 0.2 }, { n: 440, d: 0.2 }, { n: 523, d: 0.4 },
      { n: 494, d: 0.2 }, { n: 440, d: 0.2 }, { n: 392, d: 0.2 }, { n: 330, d: 0.4 },
      { n: 294, d: 0.2 }, { n: 330, d: 0.2 }, { n: 392, d: 0.4 },
      { n: 523, d: 0.15 }, { n: 494, d: 0.15 }, { n: 440, d: 0.15 }, { n: 523, d: 0.3 },
      { n: 587, d: 0.2 }, { n: 523, d: 0.2 }, { n: 494, d: 0.3 },
      { n: 440, d: 0.2 }, { n: 392, d: 0.2 }, { n: 330, d: 0.2 }, { n: 392, d: 0.6 },
      { n: 0, d: 0.3 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'menu') return;
      const m = melody[index % melody.length];
      if (m.n > 0) this.playTone(m.n, m.d * 0.7, 'square', 0.05 * this.volume.music);
      if (m.n > 0) this.playTone(m.n / 2, m.d * 0.7, 'triangle', 0.03 * this.volume.music);
      if (index % 2 === 0) this.playTone(80, 0.03, 'sawtooth', 0.04 * this.volume.music);
      if (index % 4 === 2) this.playTone(200, 0.02, 'square', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playClinicMusic() {
    if (!this.musicEnabled || this.currentTrack === 'clinic') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'clinic';

    const melody = [
      { n: 392, d: 0.3 }, { n: 440, d: 0.3 }, { n: 494, d: 0.3 }, { n: 523, d: 0.6 },
      { n: 494, d: 0.3 }, { n: 440, d: 0.3 }, { n: 392, d: 0.6 },
      { n: 349, d: 0.3 }, { n: 392, d: 0.3 }, { n: 440, d: 0.6 },
      { n: 392, d: 0.3 }, { n: 349, d: 0.3 }, { n: 330, d: 0.6 },
      { n: 294, d: 0.3 }, { n: 330, d: 0.3 }, { n: 392, d: 0.6 },
      { n: 440, d: 0.3 }, { n: 392, d: 0.3 }, { n: 349, d: 0.6 },
      { n: 0, d: 0.4 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'clinic') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.6, 'triangle', 0.04 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.6, 'sine', 0.02 * this.volume.music);
      }
      if (index % 3 === 0) this.playTone(60, 0.04, 'sine', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playTreatmentMusic() {
    if (!this.musicEnabled || this.currentTrack === 'treatment') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'treatment';

    const melody = [
      { n: 262, d: 0.2 }, { n: 294, d: 0.2 }, { n: 330, d: 0.2 }, { n: 349, d: 0.2 },
      { n: 392, d: 0.4 }, { n: 349, d: 0.2 }, { n: 330, d: 0.2 },
      { n: 294, d: 0.2 }, { n: 330, d: 0.4 }, { n: 262, d: 0.2 },
      { n: 294, d: 0.2 }, { n: 349, d: 0.2 }, { n: 330, d: 0.2 }, { n: 294, d: 0.4 },
      { n: 262, d: 0.2 }, { n: 330, d: 0.2 }, { n: 392, d: 0.4 },
      { n: 440, d: 0.2 }, { n: 392, d: 0.2 }, { n: 349, d: 0.4 },
      { n: 330, d: 0.2 }, { n: 294, d: 0.2 }, { n: 262, d: 0.4 },
      { n: 0, d: 0.2 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'treatment') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.65, 'square', 0.04 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.5, 'triangle', 0.025 * this.volume.music);
      }
      if (index % 2 === 0) this.playTone(80, 0.03, 'sawtooth', 0.04 * this.volume.music);
      if (index % 4 === 0) this.playTone(150, 0.02, 'square', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playShopMusic() {
    if (!this.musicEnabled || this.currentTrack === 'shop') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'shop';

    const melody = [
      { n: 523, d: 0.15 }, { n: 587, d: 0.15 }, { n: 659, d: 0.3 },
      { n: 587, d: 0.15 }, { n: 523, d: 0.15 }, { n: 494, d: 0.3 },
      { n: 440, d: 0.15 }, { n: 494, d: 0.15 }, { n: 523, d: 0.3 },
      { n: 659, d: 0.15 }, { n: 587, d: 0.15 }, { n: 523, d: 0.3 },
      { n: 494, d: 0.15 }, { n: 523, d: 0.15 }, { n: 587, d: 0.3 },
      { n: 659, d: 0.3 }, { n: 784, d: 0.3 }, { n: 659, d: 0.6 },
      { n: 0, d: 0.3 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'shop') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.6, 'square', 0.04 * this.volume.music);
        this.playTone(m.n / 4, m.d * 0.5, 'triangle', 0.025 * this.volume.music);
      }
      if (index % 2 === 0) this.playTone(100, 0.03, 'sawtooth', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playEventMusic() {
    if (!this.musicEnabled || this.currentTrack === 'event') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'event';

    const melody = [
      { n: 440, d: 0.2 }, { n: 523, d: 0.2 }, { n: 659, d: 0.4 },
      { n: 587, d: 0.2 }, { n: 523, d: 0.2 }, { n: 659, d: 0.2 }, { n: 784, d: 0.4 },
      { n: 659, d: 0.2 }, { n: 587, d: 0.2 }, { n: 523, d: 0.4 },
      { n: 440, d: 0.2 }, { n: 523, d: 0.2 }, { n: 587, d: 0.4 },
      { n: 659, d: 0.2 }, { n: 784, d: 0.2 }, { n: 880, d: 0.6 },
      { n: 784, d: 0.2 }, { n: 659, d: 0.2 }, { n: 523, d: 0.4 },
      { n: 0, d: 0.3 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'event') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.7, 'square', 0.045 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.6, 'triangle', 0.03 * this.volume.music);
      }
      if (index % 2 === 0) this.playTone(80, 0.04, 'sawtooth', 0.04 * this.volume.music);
      if (index % 4 === 2) this.playTone(120, 0.03, 'square', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playAchievementsMusic() {
    if (!this.musicEnabled || this.currentTrack === 'achievements') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'achievements';

    const melody = [
      { n: 392, d: 0.3 }, { n: 523, d: 0.3 }, { n: 659, d: 0.3 }, { n: 784, d: 0.6 },
      { n: 698, d: 0.3 }, { n: 659, d: 0.3 }, { n: 523, d: 0.6 },
      { n: 440, d: 0.3 }, { n: 523, d: 0.3 }, { n: 659, d: 0.6 },
      { n: 784, d: 0.3 }, { n: 698, d: 0.3 }, { n: 659, d: 0.3 }, { n: 523, d: 0.6 },
      { n: 440, d: 0.3 }, { n: 523, d: 0.3 }, { n: 659, d: 0.3 }, { n: 784, d: 0.6 },
      { n: 880, d: 0.3 }, { n: 784, d: 0.3 }, { n: 659, d: 0.6 },
      { n: 0, d: 0.4 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'achievements') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.5, 'triangle', 0.04 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.5, 'sine', 0.025 * this.volume.music);
      }
      if (index % 3 === 0) this.playTone(200, 0.04, 'square', 0.025 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playTutorialMusic() {
    if (!this.musicEnabled || this.currentTrack === 'tutorial') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'tutorial';

    const melody = [
      { n: 330, d: 0.25 }, { n: 370, d: 0.25 }, { n: 392, d: 0.25 }, { n: 440, d: 0.5 },
      { n: 392, d: 0.25 }, { n: 440, d: 0.25 }, { n: 494, d: 0.5 },
      { n: 440, d: 0.25 }, { n: 392, d: 0.25 }, { n: 330, d: 0.5 },
      { n: 294, d: 0.25 }, { n: 330, d: 0.25 }, { n: 370, d: 0.25 }, { n: 392, d: 0.5 },
      { n: 370, d: 0.25 }, { n: 392, d: 0.25 }, { n: 440, d: 0.5 },
      { n: 392, d: 0.25 }, { n: 330, d: 0.25 }, { n: 294, d: 0.5 },
      { n: 330, d: 0.25 }, { n: 370, d: 0.25 }, { n: 392, d: 0.25 }, { n: 440, d: 0.5 },
      { n: 0, d: 0.3 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'tutorial') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.6, 'square', 0.035 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.6, 'triangle', 0.02 * this.volume.music);
      }
      if (index % 2 === 0) this.playTone(100, 0.03, 'sawtooth', 0.02 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playPerfectDayMusic() {
    if (!this.musicEnabled || this.currentTrack === 'perfectDay') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'perfectDay';

    const melody = [
      { n: 523, d: 0.15 }, { n: 659, d: 0.15 }, { n: 784, d: 0.3 }, { n: 880, d: 0.3 },
      { n: 784, d: 0.15 }, { n: 659, d: 0.15 }, { n: 523, d: 0.3 },
      { n: 587, d: 0.15 }, { n: 698, d: 0.15 }, { n: 784, d: 0.3 }, { n: 988, d: 0.3 },
      { n: 880, d: 0.15 }, { n: 784, d: 0.15 }, { n: 659, d: 0.3 },
      { n: 523, d: 0.15 }, { n: 659, d: 0.15 }, { n: 784, d: 0.3 }, { n: 1047, d: 0.6 },
      { n: 988, d: 0.15 }, { n: 880, d: 0.15 }, { n: 784, d: 0.3 }, { n: 659, d: 0.3 },
      { n: 0, d: 0.4 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'perfectDay') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.6, 'square', 0.05 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.5, 'triangle', 0.03 * this.volume.music);
      }
      if (index % 2 === 0) this.playTone(80, 0.03, 'sawtooth', 0.04 * this.volume.music);
      if (index % 4 === 0) this.playTone(150, 0.04, 'square', 0.03 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playErrorMusic() {
    if (!this.musicEnabled || this.currentTrack === 'error') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'error';

    const melody = [
      { n: 220, d: 0.4 }, { n: 196, d: 0.4 }, { n: 165, d: 0.4 },
      { n: 147, d: 0.4 }, { n: 165, d: 0.4 }, { n: 196, d: 0.4 },
      { n: 220, d: 0.3 }, { n: 196, d: 0.3 }, { n: 165, d: 0.6 },
      { n: 0, d: 0.5 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'error') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.7, 'sawtooth', 0.05 * this.volume.music);
        this.playTone(m.n * 1.5, m.d * 0.5, 'square', 0.03 * this.volume.music);
      }
      if (index % 2 === 1) this.playTone(80, 0.15, 'sine', 0.04 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  playNightMusic() {
    if (!this.musicEnabled || this.currentTrack === 'night') return;
    this.init();
    this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = 'night';

    const melody = [
      { n: 294, d: 0.4 }, { n: 330, d: 0.4 }, { n: 294, d: 0.4 }, { n: 262, d: 0.8 },
      { n: 247, d: 0.4 }, { n: 262, d: 0.4 }, { n: 294, d: 0.4 }, { n: 330, d: 0.8 },
      { n: 294, d: 0.4 }, { n: 330, d: 0.4 }, { n: 349, d: 0.4 }, { n: 330, d: 0.8 },
      { n: 294, d: 0.4 }, { n: 262, d: 0.4 }, { n: 247, d: 0.4 }, { n: 220, d: 0.8 },
      { n: 0, d: 0.6 },
    ];

    const tempo = this._getTempoMultiplier();
    const playLoop = (index = 0) => {
      if (!this.musicPlaying || this.currentTrack !== 'night') return;
      const m = melody[index % melody.length];
      if (m.n > 0) {
        this.playTone(m.n, m.d * 0.7, 'sine', 0.03 * this.volume.music);
        this.playTone(m.n / 2, m.d * 0.7, 'triangle', 0.015 * this.volume.music);
      }
      if (index % 4 === 0) this.playTone(50, 0.3, 'sine', 0.02 * this.volume.music);
      this.musicTimeout = this._scheduleNote(() => playLoop(index + 1), m.d * 1000 / tempo);
    };
    playLoop();
  }

  _getTempoMultiplier() {
    return 1 + (this.currentLevel - 1) * 0.1;
  }

  setLevel(level) {
    this.currentLevel = level || 1;
  }

  setVolume(type, value) {
    if (type === 'music' || type === 'effects' || type === 'ui') {
      this.volume[type] = Math.max(0, Math.min(1, value));
    }
  }

  muteEffects() {
    this.volume.effects = 0;
  }

  unmuteEffects() {
    this.volume.effects = 1;
  }

  muteMusic() {
    this.musicEnabled = false;
    this.stopMusic();
  }

  unmuteMusic() {
    this.musicEnabled = true;
  }

  isEffectsMuted() {
    return this.volume.effects === 0;
  }

  isMusicMuted() {
    return !this.musicEnabled;
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) this.stopMusic();
    return this.musicEnabled;
  }

  playGameMusic() { this.playClinicMusic(); }
}

export const soundManager = new SoundManager();
export default soundManager;
