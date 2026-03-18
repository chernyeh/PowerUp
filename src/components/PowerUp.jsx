'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Play as PlayIcon } from 'lucide-react';

export default function PowerUp() {
  const [stage, setStage] = useState('config');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [skipGoal, setSkipGoal] = useState(null);
  const [showSkipGoalModal, setShowSkipGoalModal] = useState(false);
  const [skipInput, setSkipInput] = useState('');
  
  const [ageGroup, setAgeGroup] = useState('11-12');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(20);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [estimatedSkips, setEstimatedSkips] = useState(0);
  const [balanceCountdown, setBalanceCountdown] = useState(null);
  
  const synth = useRef(null);
  const balanceAnnounceRef = useRef(false);

  // SKIP TRACKING - Using localStorage
  const [skipStats, setSkipStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
    lastResetDate: new Date().toDateString(),
  });

  useEffect(() => {
    // Load skip stats from localStorage
    const saved = localStorage.getItem('powerupSkipStats');
    if (saved) {
      const stats = JSON.parse(saved);
      // Check if day has changed
      const today = new Date().toDateString();
      if (stats.lastResetDate !== today) {
        // New day - reset daily but keep others
        stats.daily = 0;
        stats.lastResetDate = today;
      }
      setSkipStats(stats);
    }
  }, []);

  useEffect(() => {
    // Save skip stats to localStorage whenever they change
    localStorage.setItem('powerupSkipStats', JSON.stringify(skipStats));
  }, [skipStats]);

  // Initialize Web Speech API with better voice
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown, isRunning, stage]);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0 && countdown === 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            moveToNextExercise();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, currentIndex, workoutPlan, countdown]);

  // BALANCE BOARD COUNTDOWN (every 10 seconds, drop low for 5)
  useEffect(() => {
    let interval;
    const current = workoutPlan[currentIndex];
    
    if (isRunning && !isPaused && current?.type === 'exercise' && current.exercise === 'balanceBoard' && countdown === 0) {
      // Check if we need to trigger "go lower" reminder
      const timeLeftRounded = Math.floor(timeLeft);
      
      // Trigger every 10 seconds
      if (timeLeftRounded > 0 && timeLeftRounded % 10 === 0 && !balanceAnnounceRef.current) {
        balanceAnnounceRef.current = true;
        speak('Go lower now');
        setBalanceCountdown(5);
        
        // Reset flag after 1 second
        setTimeout(() => {
          balanceAnnounceRef.current = false;
        }, 1000);
      } else if (timeLeftRounded % 10 !== 0) {
        balanceAnnounceRef.current = false;
      }
    }

    // Balance countdown (5 seconds)
    if (balanceCountdown !== null && balanceCountdown > 0 && isRunning && !isPaused) {
      interval = setTimeout(() => {
        const next = balanceCountdown - 1;
        if (next > 0) {
          speak(next.toString());
        }
        setBalanceCountdown(next);
      }, 1000);
    } else if (balanceCountdown === 0) {
      setBalanceCountdown(null);
    }

    return () => clearTimeout(interval);
  }, [isRunning, isPaused, timeLeft, currentIndex, workoutPlan, countdown, balanceCountdown]);

  const encouragingPhrases = [
    'You\'ve got this! Keep going!',
    'Amazing effort! You\'re doing great!',
    'Feeling strong? Keep pushing!',
    'You\'re crushing it!',
    'One more breath, you\'ve got this!',
    'Great form! Keep it up!',
    'You\'re almost there!',
    'Believe in yourself! You can do it!',
    'Every rep counts! Keep going!',
    'You\'re stronger than you think!',
    'Push through! You\'re doing awesome!',
    'This is your moment! Own it!',
    'You\'re on fire! Keep the momentum!',
    'Your body is capable of amazing things!',
    'Don\'t give up! You\'re so close!',
  ];

  const getRandomEncouragement = () => {
    return encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
  };

  // PRESETS
  const presets = {
    matt: {
      name: 'Matt\'s Workout',
      age: '11-12',
      defaultSkipGoal: 500,
      fitnessLevel: 'intermediate',
      description: 'Cardio, Core & Balance',
      emoji: '⭐',
    },
  };

  // ALL EXERCISES - Enhanced tips with modifications and alternatives
  const exercises = {
    skipping: { caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 }, description: 'Skipping', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Keep steady rhythm, land softly on the balls of your feet. Modification: Double unders (rope passes twice per jump) for extra intensity. Alternative: Jump for height instead of speed.' },
    plank: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Plank Hold', duration: { light: 30, intermediate: 45, vigorous: 60 }, tips: 'Keep your body straight like a board, engage your core! Modification: Plank with shoulder taps or arm lifts for added challenge. Alternative: Plank walks or moving planks.' },
    sidePlank: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Side Plank', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Stack your feet and keep your hips high. Modification: Lift your top leg or arm while holding. Alternative: Side plank with rotation.' },
    crunches: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Hands behind your head, lift your shoulders only. Keep neck neutral. Modification: Add a pause at the top, or do weighted crunches. Alternative: Decline crunches.' },
    bicycleCrunches: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Bicycle Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Bring opposite elbow to knee, alternate sides smoothly. Keep a steady rhythm. Modification: Slow down for more time under tension. Alternative: Reverse bicycle crunches.' },
    mountainClimbers: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Mountain Climbers', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Start in plank, bring knees to chest quickly, keep hips level! Modification: Cross-body mountain climbers for added core work. Alternative: Slow, controlled mountain climbers.' },
    legRaises: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Leg Raises', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Lie flat, lift legs slowly without bending knees. Keep lower back pressed to floor. Modification: Add pauses or do single-leg raises. Alternative: Hanging leg raises from a bar.' },
    balanceBoard: { caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 }, description: 'Balance Board', duration: { light: 90, intermediate: 90, vigorous: 90 }, tips: 'Focus on stability, small adjustments help! Every 10 seconds, drop low for 5 seconds. Modification: Close your eyes or add arm movements. Alternative: Single-leg balancing or bosu ball work.' },
    jumpingJacks: { caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 }, description: 'Jumping Jacks', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Keep a steady pace, feet apart, arms up! Land softly to protect joints. Modification: Fast, explosive jumping jacks. Alternative: Step-touch jacks or side-to-side jacks.' },
    marchingInPlace: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 }, description: 'Marching in Place', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lift your knees up high, keep your arms moving in sync. Modification: Add arm variations or lift knees even higher. Alternative: High-intensity sprinting in place.' },
    walkingLunges: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Walking Lunges', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Step forward and bend your back knee, keep your torso upright. Modification: Add a jump between lunges or hold weights. Alternative: Reverse walking lunges or stationary lunges.' },
    highKnees: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'High Knees', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Pump your knees up to hip height, keep moving fast! Drive from your hips. Modification: Sprint-style high knees or add arm drive. Alternative: Bounding or skipping with high knees.' },
    burpees: { caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 }, description: 'Burpees', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Go at your own pace, quality over speed! Modification: Add a push-up or jump at the top for intensity. Alternative: Modified burpees without the jump.' },
    pushups: { caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 }, description: 'Push-ups', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lower yourself until chest nearly touches ground, keep elbows close! Modification: Diamond push-ups or decline push-ups. Alternative: Knee push-ups or wall push-ups.' },
    squats: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Squats', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Bend your knees and lower your hips, keep your chest up! Modification: Jump squats or pistol squats for challenge. Alternative: Wall sits or sumo squats.' },
    jumpSquats: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Jump Squats', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Squat down then jump explosively, land softly. Modification: Add a pause at the bottom. Alternative: Pogo jumps or tuck jumps.' },
    gluteBridges: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Glute Bridges', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lie on your back, push through heels, squeeze glutes at top! Modification: Single-leg bridges or add weights. Alternative: Hip thrusts or step-ups.' },
    singleLegStand: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Single Leg Stand', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Stand on one leg, keep your core tight, switch legs halfway. Focus on a point ahead. Modification: Close your eyes or add arm movements. Alternative: Flamingo pose or pistol squat progressions.' },
    downwardDog: { caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 }, description: 'Downward Dog', duration: { light: 35, intermediate: 45, vigorous: 55 }, tips: 'Hands and feet on ground, push your hips up high. Breathe deeply. Modification: Add leg lifts or moves. Alternative: Dolphin pose or upward dog.' },
    armCircles: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Arm Circles', duration: { light: 35, intermediate: 45, vigorous: 55 }, tips: 'Small circles first, then larger, both directions! Keep shoulders relaxed. Modification: Add weight or increase speed. Alternative: Arm cross-overs or shoulder rolls.' },
    tricepDips: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Tricep Dips', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Use a chair or bench, lower your body slowly, keep elbows close. Modification: Feet on elevated surface or add weight. Alternative: Bench dips or resistance band dips.' },
  };

  const goals = {
    general: ['skipping', 'pushups', 'squats', 'mountainClimbers'],
    core: ['plank', 'sidePlank', 'mountainClimbers', 'crunches', 'bicycleCrunches', 'legRaises'],
    cardio: ['skipping', 'jumpingJacks', 'highKnees', 'burpees'],
    strength: ['pushups', 'squats', 'gluteBridges', 'tricepDips'],
    balance: ['balanceBoard', 'sidePlank', 'singleLegStand'],
    hiit: ['burpees', 'jumpSquats', 'jumpingJacks'],
  };

  const colors = {
    primary: '#d97706',
    primaryLight: '#f59e0b',
    primaryDark: '#b45309',
    dark: '#78350f',
    text: '#5f3817',
    textSecondary: '#8b5a2b',
    border: '#ddd6d0',
    light: '#fef6f0',
  };

  // VOICE - Using better voice options
  const speak = (text) => {
    if (synth.current) {
      synth.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      const voices = synth.current.getVoices();
      
      // Try to find Sophia or similar warm female voice
      let selectedVoice = voices.find(v => 
        v.name.includes('Sophia') || 
        v.name.includes('Google US English Female') ||
        v.name.includes('Victoria') ||
        v.name.includes('Samantha')
      );
      
      // Fallback to any female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.name.includes('female') || 
          v.name.includes('Female') || 
          v.name.includes('woman') ||
          v.name.includes('Woman')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      synth.current.speak(utterance);
    }
  };

  const calculateSkippingDuration = (goal) => {
    // 105 skips per 45 seconds = 2.33 skips/second
    // Duration in seconds needed
    return Math.ceil((goal / 105) * 45);
  };

  const generatePlan = () => {
    if (!selectedPreset && !selectedGoal && !selectedExercises.length) {
      alert('Please select a workout option');
      return;
    }

    let exercisesToUse = [];
    let skipsForWorkout = skipGoal || 250;
    let totalSkippingDuration = 0;

    // If preset with skipping, get the skipping duration
    if (selectedPreset === 'matt') {
      exercisesToUse = ['skipping', 'plank', 'balanceBoard'];
      skipsForWorkout = skipGoal || 500;
      totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
    } else if (selectedGoal) {
      exercisesToUse = goals[selectedGoal];
      if (exercisesToUse.includes('skipping')) {
        totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
      }
    } else {
      exercisesToUse = selectedExercises.length > 0 ? selectedExercises : Object.keys(exercises).slice(0, 5);
      if (exercisesToUse.includes('skipping')) {
        totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
      }
    }

    // SORT: Cardio first, then Core/Strength, then Balance last
    const cardioExercises = ['skipping', 'jumpingJacks', 'highKnees', 'burpees', 'mountainClimbers'];
    const balanceExercises = ['balanceBoard', 'sidePlank', 'singleLegStand'];
    
    const sortedExercises = [
      ...exercisesToUse.filter(ex => cardioExercises.includes(ex)),
      ...exercisesToUse.filter(ex => !cardioExercises.includes(ex) && !balanceExercises.includes(ex)),
      ...exercisesToUse.filter(ex => balanceExercises.includes(ex)),
    ];

    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const plan = [];

    // For skipping: Cap at 60s per set, round up to next 30s
    if (sortedExercises.includes('skipping')) {
      let remainingSeconds = totalSkippingDuration;
      let skippingSets = 0;
      
      while (remainingSeconds > 0) {
        skippingSets++;
        let setDuration;
        
        if (remainingSeconds > 60) {
          setDuration = 60;
        } else {
          // Round up remaining time to next 30 seconds
          setDuration = Math.ceil(remainingSeconds / 30) * 30;
        }
        
        plan.push({ exercise: 'skipping', duration: setDuration, type: 'exercise', set: skippingSets, totalSets: skippingSets, isSkipping: true, skipGoal: skipsForWorkout });
        remainingSeconds -= setDuration;
        
        // 15 second rest between skipping sets (except after last one)
        if (remainingSeconds > 0) {
          plan.push({ type: 'transition', duration: 15 });
        }
      }
      
      // 1 minute rest after all skipping
      plan.push({ type: 'rest', duration: 60, afterSkipping: true });
    }

    // Other exercises - GROUPED BY EXERCISE TYPE (consecutive sets)
    const otherExercises = sortedExercises.filter(ex => ex !== 'skipping');
    
    for (const exercise of otherExercises) {
      const exerciseData = exercises[exercise];
      const isBalance = balanceExercises.includes(exercise);
      
      // Determine number of sets for this exercise
      let exerciseSets = sets;
      if (isBalance && duration < 25) {
        // If time is tight, reduce balance sets
        exerciseSets = 2;
      }
      
      // Do all sets of this exercise consecutively
      for (let set = 1; set <= exerciseSets; set++) {
        const exerciseDuration = isBalance ? 90 : exerciseData.duration[fitnessLevel];
        plan.push({ exercise: exercise, duration: exerciseDuration, type: 'exercise', set, totalSets: exerciseSets });
        
        // 15 second rest between sets of same exercise
        if (set < exerciseSets) {
          plan.push({ type: 'transition', duration: 15 });
        }
      }
      
      // Rest between different exercises
      const exerciseIndex = otherExercises.indexOf(exercise);
      if (exerciseIndex < otherExercises.length - 1) {
        plan.push({ type: 'rest', duration: 45 });
      }
    }

    setWorkoutPlan(plan);
    setCurrentIndex(0);
    setTimeLeft(45);
    setCountdown(5);
    setStage('prep');
  };

  const startWorkout = () => {
    setStage('workout');
    setCountdown(5);
    setTimeLeft(45);
    speak('Get ready! Starting in 5, 4, 3, 2, 1. Let\'s go!');
    setTimeout(() => {
      setIsRunning(true);
      setCountdown(0);
      const firstExercise = workoutPlan[0];
      setTimeLeft(firstExercise.duration);
      
      // Calculate estimated skips for first exercise
      if (firstExercise.isSkipping) {
        const skipsEst = Math.round((firstExercise.duration / 45) * 105);
        setEstimatedSkips(skipsEst);
      }
    }, 5100);
  };

  const moveToNextExercise = () => {
    if (currentIndex < workoutPlan.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextItem = workoutPlan[nextIndex];
      setTimeLeft(nextItem.duration);
      setBalanceCountdown(null);
      balanceAnnounceRef.current = false;
      
      if (nextItem.type === 'exercise') {
        if (nextItem.isSkipping) {
          const skipsEst = Math.round((nextItem.duration / 45) * 105);
          setEstimatedSkips(skipsEst);
          speak(`Next up: ${exercises[nextItem.exercise].description}. Get ready for ${skipsEst} skips. ${getRandomEncouragement()}`);
        } else {
          speak(`Next up: ${exercises[nextItem.exercise].description}. ${getRandomEncouragement()}`);
        }
      } else if (nextItem.type === 'transition') {
        speak('Take a breath, get ready for the next one');
      } else if (nextItem.type === 'rest') {
        if (nextItem.afterSkipping) {
          speak('Great skipping! Time for a one-minute rest. Catch your breath!');
        } else {
          speak('Time to rest. Catch your breath!');
        }
      }
    } else {
      // Workout complete - add skips to daily count
      if (skipGoal) {
        setSkipStats(prev => ({
          ...prev,
          daily: prev.daily + Math.round(estimatedSkips),
          weekly: prev.weekly + Math.round(estimatedSkips),
          monthly: prev.monthly + Math.round(estimatedSkips),
          total: prev.total + Math.round(estimatedSkips),
        }));
      }
      
      setStage('results');
      setIsRunning(false);
      speak('Amazing! You did it! Great workout!');
    }
  };

  // CONFIG SCREEN
  if (stage === 'config') {
    return (
      <div style={{
        padding: '50px 40px',
        fontFamily: '"Lora", Georgia, serif',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: '100vh',
        background: colors.light,
      }}>
        <div style={{ marginBottom: '50px' }}>
          <h1 style={{ color: colors.primary, marginBottom: '10px', fontSize: '3.2em', fontFamily: '"Lora", Georgia, serif', fontWeight: '700', letterSpacing: '1px' }}>PowerUp</h1>
          <p style={{ color: colors.textSecondary, fontSize: '1.2em', fontStyle: 'italic', fontWeight: '500' }}>Your Personal Fitness Coach</p>
        </div>

        {/* PRESETS */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Saved Workouts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {Object.entries(presets).map(([key, preset]) => {
              const dailyProgress = (skipStats.daily / preset.defaultSkipGoal) * 100;
              return (
                <div key={key} onClick={() => {
                  setSelectedPreset(key);
                  setSelectedGoal(null);
                  setSelectedExercises([]);
                  setShowSkipGoalModal(true);
                  setSkipInput(preset.defaultSkipGoal.toString());
                }} style={{
                  padding: '20px',
                  background: selectedPreset === key ? colors.primary : 'white',
                  color: selectedPreset === key ? 'white' : colors.text,
                  border: `2px solid ${selectedPreset === key ? colors.primary : colors.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: '"Lora", Georgia, serif',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>{preset.emoji}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '8px' }}>{preset.name}</div>
                  <div style={{ fontSize: '0.9em', opacity: 0.9, marginBottom: '10px' }}>{preset.description}</div>
                  <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                    Skips Today: {skipStats.daily}/{preset.defaultSkipGoal}
                  </div>
                  <div style={{ background: colors.border, height: '8px', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{
                      background: selectedPreset === key ? 'white' : colors.primary,
                      height: '100%',
                      width: `${Math.min(dailyProgress, 100)}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SKIP GOAL MODAL */}
        {showSkipGoalModal && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '400px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ color: colors.primary, marginBottom: '20px', fontSize: '1.4em' }}>Skip Goal</h3>
              <p style={{ color: colors.text, marginBottom: '15px' }}>How many skips would you like to do today?</p>
              <input
                type="number"
                value={skipInput}
                onChange={(e) => setSkipInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '1.1em',
                  marginBottom: '15px',
                  boxSizing: 'border-box',
                  color: colors.text,
                }}
              />
              <style>{`
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                input[type="number"] {
                  -moz-appearance: textfield;
                }
              `}</style>
              <div style={{ color: colors.textSecondary, fontSize: '0.9em', marginBottom: '20px' }}>
                Est. Calories Burned: ~{Math.round((parseInt(skipInput || 250) / 105) * 45 * 0.12)}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowSkipGoalModal(false);
                    setSelectedPreset(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: colors.border,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: '"Lora", Georgia, serif',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSkipGoal(parseInt(skipInput || 250));
                    setShowSkipGoalModal(false);
                    setDuration(25);
                    generatePlan();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: '"Lora", Georgia, serif',
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Or Customize</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Age Group</label>
              <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', color: colors.text, backgroundColor: 'white', cursor: 'pointer' }}>
                <option>11-12</option>
                <option>13-17</option>
                <option>18-25</option>
                <option>26-35</option>
                <option>36-50</option>
                <option>50+</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Fitness Level</label>
              <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', color: colors.text, backgroundColor: 'white', cursor: 'pointer' }}>
                <option value="light">Light</option>
                <option value="intermediate">Intermediate</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Duration: {duration} min</label>
              <input type="range" min="5" max="60" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Quick Goals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            {Object.keys(goals).map((goal) => {
              const goalExercises = goals[goal].map(ex => exercises[ex].description).slice(0, 3).join(', ');
              return (
                <button key={goal} onClick={() => { setSelectedGoal(goal); setSelectedExercises([]); setSelectedPreset(null); }} style={{ padding: '18px', background: selectedGoal === goal ? colors.primary : 'white', color: selectedGoal === goal ? 'white' : colors.text, border: `2px solid ${selectedGoal === goal ? colors.primary : colors.border}`, borderRadius: '8px', cursor: 'pointer', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', fontWeight: selectedGoal === goal ? 'bold' : 'normal', transition: 'all 0.3s ease', textAlign: 'center', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.8em', marginBottom: '8px' }}>
                    {goal === 'general' && '⭐'}
                    {goal === 'core' && '💪'}
                    {goal === 'cardio' && '🏃'}
                    {goal === 'strength' && '💥'}
                    {goal === 'balance' && '⚖️'}
                    {goal === 'hiit' && '⚡'}
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1em' }}>
                    {goal === 'general' && 'General'}
                    {goal === 'core' && 'Core'}
                    {goal === 'cardio' && 'Cardio'}
                    {goal === 'strength' && 'Strength'}
                    {goal === 'balance' && 'Balance'}
                    {goal === 'hiit' && 'HIIT'}
                  </div>
                  <div style={{ fontSize: '0.8em', opacity: 0.9, lineHeight: '1.4' }}>
                    {goalExercises}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Or Mix & Match Exercises</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '0.95em' }}>({selectedExercises.length} selected)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: 'white' }}>
            {Object.keys(exercises).map((key) => (
              <button key={key} onClick={() => { setSelectedGoal(null); setSelectedPreset(null); if (selectedExercises.includes(key)) { setSelectedExercises(selectedExercises.filter((ex) => ex !== key)); } else { setSelectedExercises([...selectedExercises, key]); } }} style={{ padding: '12px', background: selectedExercises.includes(key) ? colors.primaryLight : 'white', color: selectedExercises.includes(key) ? 'white' : colors.text, border: `1px solid ${selectedExercises.includes(key) ? colors.primaryLight : colors.border}`, borderRadius: '6px', cursor: 'pointer', fontFamily: '"Lora", Georgia, serif', fontSize: '0.9em', fontWeight: selectedExercises.includes(key) ? 'bold' : 'normal', textAlign: 'center', transition: 'all 0.2s ease' }}>
                {exercises[key].description}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button onClick={() => generatePlan()} style={{ width: '100%', padding: '16px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif', fontSize: '1.1em', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)' }} onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)'} onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(217, 119, 6, 0.2)'}>
            📋 Prepare Workout
          </button>
        </div>
      </div>
    );
  }

  // PREP SCREEN
  if (stage === 'prep') {
    return (
      <div style={{ padding: '40px', fontFamily: '"Lora", Georgia, serif', maxWidth: '700px', margin: '0 auto', minHeight: '100vh', background: colors.light, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <h2 style={{ color: colors.primary, marginBottom: '20px', fontSize: '2em' }}>Your Workout Plan</h2>
        
        <button onClick={() => startWorkout()} style={{ width: '100%', padding: '14px', fontSize: '1.1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif', marginBottom: '25px' }}>
          🚀 Start Workout
        </button>

        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {workoutPlan.map((item, idx) => (
              <div key={idx} style={{ padding: '10px', background: colors.light, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontWeight: item.type === 'exercise' ? 'bold' : 'normal', fontSize: '0.85em', textAlign: 'center', lineHeight: '1.3' }}>
                {item.type === 'exercise' ? (
                  <>
                    <div>{exercises[item.exercise].description}</div>
                    <div style={{ fontSize: '0.75em', opacity: 0.7, marginTop: '4px' }}>{item.duration}s</div>
                  </>
                ) : item.type === 'rest' ? (
                  <>
                    <div>Rest</div>
                    <div style={{ fontSize: '0.75em', opacity: 0.7, marginTop: '4px' }}>{item.duration}s</div>
                  </>
                ) : (
                  <>
                    <div>Break</div>
                    <div style={{ fontSize: '0.75em', opacity: 0.7, marginTop: '4px' }}>{item.duration}s</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // WORKOUT SCREEN
  if (stage === 'workout') {
    const current = workoutPlan[currentIndex];
    const exerciseData = current?.type === 'exercise' ? exercises[current.exercise] : null;
    const isRest = current?.type === 'rest';
    const isTransition = current?.type === 'transition';

    return (
      <div style={{ padding: '40px', fontFamily: '"Lora", Georgia, serif', minHeight: '100vh', background: colors.light, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: colors.primary, marginBottom: '20px', fontFamily: '"Lora", Georgia, serif', fontSize: '2.2em', fontWeight: '400' }}>
            {countdown > 0 ? 'Get Ready!' : isTransition ? '✨ Quick Break' : isRest ? '😤 Rest Time' : `💪 ${exerciseData?.description}`}
          </h2>
          <div style={{ fontSize: countdown > 0 ? '24em' : '16em', color: colors.primary, marginBottom: '20px', fontWeight: 'bold', fontFamily: 'monospace', lineHeight: '1' }}>
            {countdown > 0 ? countdown : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
          </div>
          {countdown > 0 && (
            <p style={{ color: colors.text, fontSize: '1.2em', marginBottom: '20px', fontStyle: 'italic' }}>Starting your workout soon...</p>
          )}
          
          {current?.isSkipping && !countdown && (
            <p style={{ color: colors.primary, fontSize: '1.1em', fontWeight: 'bold', marginBottom: '20px' }}>
              Est. Skips: {estimatedSkips}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button onClick={() => { setIsRunning(true); setCountdown(0); setIsPaused(false); if (isTransition) { speak('Take your time, get ready'); } else if (isRest) { speak('Rest time. Breathe and relax'); } else { speak(`Starting ${exerciseData?.description}. ${getRandomEncouragement()}`); } }} style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
              <PlayIcon size={20} style={{ display: 'inline', marginRight: '8px' }} /> Play
            </button>
          ) : (
            <>
              <button onClick={() => setIsPaused(!isPaused)} style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
                <Pause size={20} style={{ display: 'inline', marginRight: '8px' }} /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={() => { setIsRunning(false); setStage('config'); setWorkoutPlan([]); }} style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
                <StopCircle size={20} style={{ display: 'inline', marginRight: '8px' }} /> Stop
              </button>
            </>
          )}
        </div>

        <p style={{ color: colors.text, marginBottom: '15px', fontSize: '1em' }}>
          Exercise {currentIndex + 1} of {workoutPlan.length}
        </p>

        {exerciseData && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '15px', border: `1px solid ${colors.border}` }}>
            {exerciseData.tips.split('. ').map((sentence, idx) => {
              const isMod = sentence.toLowerCase().includes('modification') || sentence.toLowerCase().includes('alternative');
              return (
                <p key={idx} style={{ color: colors.text, fontSize: isMod ? '0.9em' : '1em', marginBottom: idx === exerciseData.tips.split('. ').length - 1 ? '0' : '10px', lineHeight: '1.5', fontWeight: isMod ? '500' : 'normal' }}>
                  {isMod ? '→ ' : '💡 '}{sentence}{sentence.endsWith('.') ? '' : '.'}
                </p>
              );
            })}
          </div>
        )}

        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: `1px solid ${colors.border}`, maxHeight: '150px', overflowY: 'auto' }}>
          <h4 style={{ color: colors.primary, marginBottom: '10px', fontSize: '0.9em' }}>📋 Exercises</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
            {workoutPlan.map((item, idx) => (
              <div key={idx} style={{ padding: '6px', background: idx === currentIndex ? colors.primary : 'transparent', color: idx === currentIndex ? 'white' : colors.text, opacity: idx < currentIndex ? 0.5 : 1, borderRadius: '4px', fontSize: '0.7em', textAlign: 'center', border: idx === currentIndex ? 'none' : `1px solid ${colors.border}`, lineHeight: '1.3' }}>
                {item.type === 'exercise' ? (
                  <>
                    <div>{exercises[item.exercise].description}</div>
                    <div style={{ fontSize: '0.65em', opacity: 0.8 }}>{item.duration}s</div>
                  </>
                ) : item.type === 'rest' ? (
                  <>
                    <div>Rest</div>
                    <div style={{ fontSize: '0.65em', opacity: 0.8 }}>{item.duration}s</div>
                  </>
                ) : (
                  <>
                    <div>Break</div>
                    <div style={{ fontSize: '0.65em', opacity: 0.8 }}>{item.duration}s</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (stage === 'results') {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', fontFamily: '"Lora", Georgia, serif', minHeight: '100vh', background: colors.light }}>
        <h1 style={{ fontSize: '3em', color: colors.primary, marginBottom: '20px', fontFamily: '"Lora", Georgia, serif', fontWeight: '400' }}>🎉 Workout Complete!</h1>
        <p style={{ fontSize: '1.3em', color: colors.text, marginBottom: '30px' }}>Great job! You completed {workoutPlan.length} exercises.</p>
        
        {skipGoal && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: `2px solid ${colors.primary}` }}>
            <h2 style={{ color: colors.primary, marginBottom: '20px', fontSize: '1.5em' }}>Skip Count</h2>
            <p style={{ fontSize: '2em', color: colors.primary, fontWeight: 'bold', marginBottom: '10px' }}>{Math.round(estimatedSkips)} Skips</p>
            <p style={{ color: colors.text, marginBottom: '15px' }}>Daily Goal: {skipGoal}</p>
            <p style={{ color: colors.text, fontSize: '1.1em' }}>
              Today's Total: {skipStats.daily}/{skipGoal} {skipStats.daily >= skipGoal ? '✅' : ''}
            </p>
          </div>
        )}

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ color: colors.primary, marginBottom: '15px' }}>Your Skip Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.9em', marginBottom: '5px' }}>Today</p>
              <p style={{ color: colors.primary, fontSize: '1.3em', fontWeight: 'bold' }}>{skipStats.daily}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.9em', marginBottom: '5px' }}>This Week</p>
              <p style={{ color: colors.primary, fontSize: '1.3em', fontWeight: 'bold' }}>{skipStats.weekly}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.9em', marginBottom: '5px' }}>This Month</p>
              <p style={{ color: colors.primary, fontSize: '1.3em', fontWeight: 'bold' }}>{skipStats.monthly}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.9em', marginBottom: '5px' }}>Total</p>
              <p style={{ color: colors.primary, fontSize: '1.3em', fontWeight: 'bold' }}>{skipStats.total}</p>
            </div>
          </div>
        </div>

        <button onClick={() => { setStage('config'); setWorkoutPlan([]); setSelectedGoal(null); setSelectedExercises([]); setSelectedPreset(null); setSkipGoal(null); }} style={{ padding: '12px 40px', fontSize: '1.1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif' }}>
          Start New Workout
        </button>
      </div>
    );
  }
}
