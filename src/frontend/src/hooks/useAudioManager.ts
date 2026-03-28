import { useCallback, useRef } from "react";
import type { Weekday } from "../utils/weekdayCalculator";

export function useAudioManager() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return ctxRef.current;
  }, []);

  const unlockAudio = useCallback(async () => {
    try {
      const ctx = getCtx();
      await ctx.resume();
      // Play a silent oscillator to fully unlock audio on iOS
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.001);
    } catch {
      // fail silently
    }
  }, [getCtx]);

  const playTone = useCallback(
    (weekday: Weekday) => {
      const delay = 1000 + Math.random() * 500;
      setTimeout(() => {
        try {
          const ctx = getCtx();
          if (ctx.state === "suspended") ctx.resume();
          playWeekdayTone(ctx, weekday);
        } catch {
          // fail silently
        }
      }, delay);
    },
    [getCtx],
  );

  return { playTone, unlockAudio };
}

function playWeekdayTone(ctx: AudioContext, weekday: Weekday) {
  const now = ctx.currentTime;

  switch (weekday) {
    case "Monday":
      // Reflection: low Csus4 chord, slow decay
      playNote(ctx, 261.63, now, 1.8, "sine", 0.3); // C4
      playNote(ctx, 349.23, now, 1.8, "sine", 0.2); // F4
      playNote(ctx, 392.0, now, 1.8, "sine", 0.2); // G4
      break;

    case "Tuesday":
      // Pulse: two quick beeps
      playNote(ctx, 440, now, 0.12, "sine", 0.4);
      playNote(ctx, 440, now + 0.22, 0.12, "sine", 0.4);
      break;

    case "Wednesday":
      // Glass: sharp high ping
      playNote(ctx, 1200, now, 0.4, "sine", 0.5);
      break;

    case "Thursday":
      // Pop: short low thump
      playNote(ctx, 80, now, 0.15, "sine", 0.6);
      break;

    case "Friday":
      // Tri-tone: C5, E5, G5 ascending
      playNote(ctx, 523.25, now, 0.25, "sine", 0.35);
      playNote(ctx, 659.25, now + 0.2, 0.25, "sine", 0.35);
      playNote(ctx, 783.99, now + 0.4, 0.25, "sine", 0.35);
      break;

    case "Saturday":
      // Chime: C4+G4 warm bell chord
      playNote(ctx, 261.63, now, 1.2, "triangle", 0.35);
      playNote(ctx, 392.0, now, 1.2, "triangle", 0.3);
      break;

    case "Sunday":
      // Bell: C3, deep resonant, long decay
      playNote(ctx, 130.81, now, 2.5, "sine", 0.45);
      break;
  }
}

function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}
