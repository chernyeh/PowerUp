'use client';
import { useRef, useCallback } from 'react';

export function useVoice(enabled) {
  const synth = useRef(null);

  // Initialize lazily (SSR-safe)
  const getSynth = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!synth.current) synth.current = window.speechSynthesis;
    return synth.current;
  }, []);

  const speak = useCallback((text) => {
    if (!enabled) return;
    const s = getSynth();
    if (!s) return;

    s.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    s.speak(utterance);
  }, [enabled, getSynth]);

  const stop = useCallback(() => {
    const s = getSynth();
    if (s) s.cancel();
  }, [getSynth]);

  return { speak, stop };
}
