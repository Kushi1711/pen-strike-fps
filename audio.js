// ===== AUDIO SYSTEM =====
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Create audio context on user interaction
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.7;
        this.initialized = true;
    }

    // Ensure audio context is running
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Generate gunshot sound
    playGunshot() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const duration = 0.15;

        // Main shot - low frequency punch
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + duration);
        gain1.gain.setValueAtTime(0.8, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + duration);

        // Noise burst for crispness
        const noise = this.createNoiseBuffer(0.1);
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noise;
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noiseSource.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseSource.start(now);

        // High pitch snap
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now);
        osc2.stop(now + 0.05);
    }

    // Bullet impact sound
    playImpact() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const duration = 0.08;

        // Impact click
        const noise = this.createNoiseBuffer(duration);
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noise;
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        noiseSource.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseSource.start(now);

        // Low frequency resonance
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + duration);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    // Hit marker confirmation sound
    playHitMarker() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Bright beep
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Enemy eliminated sound - satisfying kill confirmation
    playKillSound() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const duration = 0.3;

        // Ascending pitch sweep
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + duration);
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.1, now + duration);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + duration);

        // Secondary harmonic
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(900, now);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + duration);
        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.05, now + duration);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now);
        osc2.stop(now + duration);
    }

    // Player damage sound
    playDamageSound() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const duration = 0.15;

        // Low buzz
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + duration);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    // Low health warning - pulsing beep
    playLowHealthWarning() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;

        for (let i = 0; i < 2; i++) {
            const offset = now + (i * 0.15);
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, offset);
            gain.gain.setValueAtTime(0.4, offset);
            gain.gain.exponentialRampToValueAtTime(0.01, offset + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(offset);
            osc.stop(offset + 0.1);
        }
    }

    // Reload sound
    playReloadSound() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Click and mechanical sounds
        const clicks = [
            { time: 0, freq: 200, duration: 0.05 },
            { time: 0.08, freq: 300, duration: 0.06 },
            { time: 0.16, freq: 250, duration: 0.08 }
        ];

        clicks.forEach(click => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(click.freq, now + click.time);
            osc.frequency.exponentialRampToValueAtTime(click.freq * 0.5, now + click.time + click.duration);
            gain.gain.setValueAtTime(0.3, now + click.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + click.time + click.duration);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + click.time);
            osc.stop(now + click.time + click.duration);
        });
    }

    // Round start sound
    playRoundStartSound() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const duration = 0.5;

        // Ascending tone
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + duration);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    // UI click sound
    playClickSound() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Background music - tactical theme
    playTacticalTheme() {
        if (!this.initialized) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const bpm = 120;
        const beatDuration = 60 / bpm;

        // Bass line
        const bassLine = [80, 80, 100, 100, 120, 120, 100, 100];
        bassLine.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sine';
            const startTime = now + (index * beatDuration);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.05, startTime + beatDuration * 0.8);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + beatDuration * 0.8);
        });

        // Lead melody - atmospheric
        const melody = [400, 450, 500, 450, 400, 350, 400, 450];
        melody.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'triangle';
            const startTime = now + (index * beatDuration * 2);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.1, startTime + beatDuration * 1.8);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + beatDuration * 1.8);
        });
    }

    // Create noise buffer for impact and gunshot sounds
    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = duration * sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, length, sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        return noiseBuffer;
    }
}

// Initialize audio system
const audioSystem = new AudioSystem();

// Initialize audio on first user interaction
document.addEventListener('click', () => {
    audioSystem.init();
}, { once: true });

document.addEventListener('touchstart', () => {
    audioSystem.init();
}, { once: true });
