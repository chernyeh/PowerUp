// src/hooks/useVoice.js
// Custom hook for text-to-speech voice guidance

import { useState, useRef, useEffect } from 'react';

export const useVoice = (enabled = true) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const supported =
      typeof window !== 'undefined' &&
      (window.speechSynthesis || window.webkitSpeechSynthesis);
    
    setIsSupported(supported);
    
    if (supported) {
      synthRef.current = window.speechSynthesis || window.webkitSpeechSynthesis;
    }
  }, []);

  const speak = (text, options = {}) => {
    if (!enabled || !synthRef.current || !text) {
      return false;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice properties
    utterance.rate = options.rate || 1.2; // Slightly faster
    utterance.pitch = options.pitch || 1; // Normal pitch
    utterance.volume = options.volume || 1; // Full volume

    // Optional: specify language
    if (options.language) {
      utterance.lang = options.language;
    }

    // Event listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('❌ Speech error:', error);
      setIsSpeaking(false);
    };

    // Start speaking
    try {
      synthRef.current.speak(utterance);
      return true;
    } catch (error) {
      console.error('❌ Error speaking:', error);
      return false;
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (synthRef.current && synthRef.current.pause) {
      synthRef.current.pause();
    }
  };

  const resume = () => {
    if (synthRef.current && synthRef.current.resume) {
      synthRef.current.resume();
    }
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
  };
};

// Preset voice messages
export const voiceMessages = {
  workoutStart: 'Starting your workout. Let\'s go!',
  workoutComplete: 'Workout complete! Fantastic effort!',
  restTime: 'Rest time. Catch your breath.',
  getReady: 'Get ready for the next exercise.',
  pushHard: 'Push hard. You\'ve got this!',
  keepGoing: (seconds) => `Keep going! You\'ve got ${seconds} seconds left.`,
  nextExercise: (exerciseName) => `Next exercise: ${exerciseName}. Get ready.`,
  pause: 'Workout paused.',
  resume: 'Resuming workout.',
};
