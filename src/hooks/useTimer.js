'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(onTick, onComplete) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  // Keep callback refs current
  onTickRef.current = onTick;
  onCompleteRef.current = onComplete;

  const start = useCallback((seconds) => {
    setTimeRemaining(seconds);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onCompleteRef.current?.();
          return 0;
        }
        onTickRef.current?.(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    resume,
    toggle,
    reset,
    setTimeRemaining,
    setIsRunning,
  };
}
