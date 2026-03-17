// src/hooks/useTimer.js
// Custom hook for workout timer management

import { useState, useEffect, useRef } from 'react';

export const useTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0; // Will be handled by parent component
        }
        return prev - 1;
      });

      setTotalTimeUsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const startTimer = (duration) => {
    setTimeRemaining(duration);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setTotalTimeUsed(0);
  };

  const setDuration = (duration) => {
    setTimeRemaining(duration);
  };

  return {
    timeRemaining,
    isRunning,
    totalTimeUsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setDuration,
    setIsRunning,
  };
};
