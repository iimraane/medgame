// ─── Sound Effects Manager ───────────────────────────────────────
// All sounds generated via Web Audio API, no external files needed.

let audioCtx = null;
let _volume = 0.5;
let _enabled = true;

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export async function resumeAudioContext() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
}

export function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
}

export function setSoundEnabled(enabled) {
    _enabled = enabled;
}

function playTone(frequency, duration, type = 'sine', rampDown = true) {
    if (!_enabled || _volume === 0) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(_volume * 0.3, ctx.currentTime);
    if (rampDown) {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function playNotes(notes, interval = 0.12) {
    notes.forEach(([freq, dur, type], i) => {
        setTimeout(() => playTone(freq, dur, type || 'sine'), i * interval * 1000);
    });
}

export function sfx_messageReceived() {
    playNotes([
        [880, 0.08, 'sine'],
        [1100, 0.12, 'sine'],
    ], 0.06);
}

export function sfx_messageSent() {
    playTone(660, 0.06, 'sine');
}

export function sfx_levelComplete() {
    playNotes([
        [523, 0.15, 'sine'],
        [659, 0.15, 'sine'],
        [784, 0.15, 'sine'],
        [1047, 0.3, 'sine'],
    ], 0.15);
}

export function sfx_newCard() {
    playNotes([
        [440, 0.1, 'triangle'],
        [660, 0.1, 'triangle'],
        [880, 0.2, 'triangle'],
    ], 0.1);
}

export function sfx_error() {
    playNotes([
        [300, 0.15, 'sawtooth'],
        [200, 0.25, 'sawtooth'],
    ], 0.12);
}

export function sfx_click() {
    playTone(800, 0.04, 'square');
}

export function sfx_perkUnlocked() {
    playNotes([
        [600, 0.1, 'sine'],
        [800, 0.1, 'sine'],
        [1000, 0.1, 'sine'],
        [1200, 0.15, 'sine'],
        [1400, 0.25, 'sine'],
    ], 0.12);
}

export function sfx_typing() {
    playTone(400 + Math.random() * 200, 0.03, 'sine');
}

export function sfx_star() {
    playNotes([
        [1000, 0.08, 'sine'],
        [1200, 0.12, 'sine'],
    ], 0.08);
}
