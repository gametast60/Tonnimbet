/**
 * Local Sound Effects Engine (0ms Latency, 100% Offline)
 * Muay Thai Money Trading System
 */

(function(window) {
    'use strict';

    let audioCtx = null;
    let isSoundEnabled = true;
    let lastPlayedPriceKey = '';
    let lastReadyStateHash = '';

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    // Auto-unlock AudioContext on first user interaction anywhere on the page
    function unlockAudio() {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('click', unlockAudio, { once: false, passive: true });
        window.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
        window.addEventListener('keydown', unlockAudio, { once: false, passive: true });
    }

    // 1. 🔔 ระฆังทองแจ้งเตือน (Golden Bell Chime - 0ms Local)
    function playGoldenBell() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // Tone 1: High crisp harmonic (880Hz -> A5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now);
            osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

            gain1.gain.setValueAtTime(0.4, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.6);

            // Tone 2: Warm bell resonance (1760Hz -> A6)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1760, now + 0.05);

            gain2.gain.setValueAtTime(0.25, now + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.start(now + 0.05);
            osc2.stop(now + 0.8);
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    // 2. 🚪 เสียงปิดรับแทง (Market Closed Gavel / Low Shutter)
    function playMarketClosed() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // Heavy low thud (160Hz -> 50Hz)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.45);

            // Secondary reverb echo
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(110, now + 0.12);
            osc2.frequency.exponentialRampToValueAtTime(30, now + 0.5);

            gain2.gain.setValueAtTime(0.35, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.start(now + 0.12);
            osc2.stop(now + 0.55);
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    // 3. ⚡ เสียงยิงคำสั่งออกตัวสำเร็จ (Order Executed Cash Chime)
    function playOrderExecuted() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C arpeggio

            freqs.forEach((f, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const t = now + (idx * 0.05);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);

                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(t);
                osc.stop(t + 0.3);
            });
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    function toggleSound() {
        isSoundEnabled = !isSoundEnabled;
        const btn = document.getElementById('btnToggleSound');
        if (btn) {
            if (isSoundEnabled) {
                btn.innerHTML = '🔊 เสียงเตือน: ON';
                btn.className = 'btn-sound-toggle on';
                btn.title = 'คลิกเพื่อปิดเสียงแจ้งเตือน';
                unlockAudio();
                playGoldenBell();
            } else {
                btn.innerHTML = '🔇 เสียงเตือน: MUTE';
                btn.className = 'btn-sound-toggle off';
                btn.title = 'คลิกเพื่อเปิดเสียงแจ้งเตือน';
            }
        }
        return isSoundEnabled;
    }

    function checkAndPlayPriceChangeAlert(priceKey) {
        if (!priceKey || priceKey === lastPlayedPriceKey) return;
        lastPlayedPriceKey = priceKey;
        playGoldenBell();
    }

    function checkAndPlayStrategyReadyAlert(stateHash) {
        if (!stateHash) {
            lastReadyStateHash = '';
            return;
        }
        if (stateHash !== lastReadyStateHash && stateHash.includes('1')) {
            lastReadyStateHash = stateHash;
            playGoldenBell();
        } else if (!stateHash.includes('1')) {
            lastReadyStateHash = '';
        }
    }

    const SoundEngine = {
        playGoldenBell,
        playMarketClosed,
        playOrderExecuted,
        toggleSound,
        isSoundEnabled: () => isSoundEnabled,
        checkAndPlayPriceChangeAlert,
        checkAndPlayStrategyReadyAlert
    };

    // Attach to global window
    window.SoundEngine = SoundEngine;
    window.toggleSound = toggleSound;

})(typeof window !== 'undefined' ? window : global);
