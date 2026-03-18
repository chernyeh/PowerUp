'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Play as PlayIcon } from 'lucide-react';

const fontStyle = {
  fontFamily: '"Fredoka", "Comfortaa", sans-serif',
  letterSpacing: '0.5px',
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

const presets = {
  matt: {
    name: 'Matt\'s Workout',
    age: '11-12',
    defaultSkipGoal: 500,
    fitnessLevel: 'intermediate',
    emoji: '⭐',
    exercises: 'Skipping • Plank • Balance Board',
    blurb: 'Cardio + Core + Balance',
  },
};

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

  const [skipStats, setSkipStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
    lastResetDate: new Date().toDateString(),
  });

  useEffect(() => {
    const saved = localStorage.getItem('powerupSkipStats');
    if (saved) {
      const stats = JSON.parse(saved);
      const today = new Date().toDateString();
      if (stats.lastResetDate !== today) {
        stats.daily = 0;
        stats.lastResetDate = today;
      }
      setSkipStats(stats);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('powerupSkipStats', JSON.stringify(skipStats));
  }, [skipStats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  const getCalorieContext = (calories) => {
    if (calories < 30) return `~${Math.round(calories / 3.5)} almonds`;
    if (calories < 50) return '1 small fruit';
    if (calories < 80) return '1 ice lolly';
    if (calories < 120) return '1 scoop ice cream';
    if (calories < 160) return '1 chocolate bar';
    if (calories < 200) return '1 slice shortcake';
    if (calories < 280) return '1 muffin';
    if (calories < 350) return '2 scoops ice cream';
    if (calories < 450) return '1 slice cake';
    if (calories < 600) return '1 cupcake';
    return `${Math.round(calories / 250)} slices cake`;
  };

  const getCaloriesBurned = (exerciseKey, durationSeconds, ageLvl, fitLvl) => {
    const exerciseData = exercises[exerciseKey];
    const caloriesPerMinute = exerciseData.caloriesPerMin[fitLvl];
    const durationMinutes = durationSeconds / 60;
    
    const ageFactors = {
      '11-12': 1.0,
      '13-17': 0.98,
      '18-25': 0.96,
      '26-35': 0.94,
      '36-50': 0.92,
      '50+': 0.88,
    };
    const ageFactor = ageFactors[ageLvl] || 0.92;
    
    return Math.round(caloriesPerMinute * durationMinutes * ageFactor);
  };

  const calculateSkippingDuration = (goal) => {
    return Math.ceil((goal / 105) * 45);
  };

  const calculateSkipsCalories = (skips) => {
    const durationSeconds = calculateSkippingDuration(skips);
    return getCaloriesBurned('skipping', durationSeconds, ageGroup, fitnessLevel);
  };

  const calculateWorkoutCalories = () => {
    if (!workoutPlan.length) return 0;
    let totalCalories = 0;
    workoutPlan.forEach(item => {
      if (item.type === 'exercise') {
        const cals = getCaloriesBurned(item.exercise, item.duration, ageGroup, fitnessLevel);
        totalCalories += cals;
      }
    });
    return totalCalories;
  };

  const speak = (text) => {
    if (synth.current) {
      synth.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      const voices = synth.current.getVoices();
      let selectedVoice = voices.find(v => 
        v.name.includes('Sophia') || 
        v.name.includes('Google US English Female') ||
        v.name.includes('Victoria') ||
        v.name.includes('Samantha')
      );
      
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.name.includes('female') || v.name.includes('Female')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      synth.current.speak(utterance);
    }
  };

  const generatePlan = () => {
    if (!selectedPreset && !selectedGoal && !selectedExercises.length) {
      alert('Please select a workout option');
      return;
    }

    let exercisesToUse = [];
    let skipsForWorkout = skipGoal || 250;
    let totalSkippingDuration = 0;

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

    const cardioExercises = ['skipping', 'jumpingJacks', 'highKnees', 'burpees', 'mountainClimbers'];
    const balanceExercises = ['balanceBoard', 'sidePlank', 'singleLegStand'];
    
    const sortedExercises = [
      ...exercisesToUse.filter(ex => cardioExercises.includes(ex)),
      ...exercisesToUse.filter(ex => !cardioExercises.includes(ex) && !balanceExercises.includes(ex)),
      ...exercisesToUse.filter(ex => balanceExercises.includes(ex)),
    ];

    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const targetDuration = duration * 60;
    let plan = [];
    let usedTime = 0;

    let skippingSets = [];
    let remainingSeconds = totalSkippingDuration;
    let skipSetCount = 0;
    
    while (remainingSeconds > 0) {
      skipSetCount++;
      let setDuration = remainingSeconds > 60 ? 60 : Math.ceil(remainingSeconds / 30) * 30;
      skippingSets.push({ exercise: 'skipping', duration: setDuration, type: 'exercise', set: skipSetCount, totalSets: skipSetCount, isSkipping: true, skipGoal: skipsForWorkout });
      remainingSeconds -= setDuration;
    }

    skippingSets.forEach((set, idx) => {
      plan.push(set);
      if (idx < skippingSets.length - 1) {
        const restDuration = (idx === 2 && skippingSets.length > 3) ? 30 : 15;
        plan.push({ type: 'transition', duration: restDuration });
        usedTime += restDuration;
      }
      usedTime += set.duration;
    });
    
    plan.push({ type: 'rest', duration: 60, afterSkipping: true });
    usedTime += 60;

    const otherExercises = sortedExercises.filter(ex => ex !== 'skipping');
    const remainingTime = targetDuration - usedTime;
    
    for (const exercise of otherExercises) {
      const exerciseData = exercises[exercise];
      const isBalance = balanceExercises.includes(exercise);
      const isPlank = exercise === 'plank';
      
      let exerciseSets = sets;
      let exerciseSetDuration = isBalance ? 90 : exerciseData.duration[fitnessLevel];
      
      if (targetDuration >= 30 * 60) {
        if (isBalance || isPlank) exerciseSets = sets + 2;
      } else if (targetDuration >= 25 * 60) {
        if (isBalance || isPlank) exerciseSets = sets + 1;
      } else if (targetDuration >= 20 * 60) {
        if (isBalance) exerciseSets = sets + 1;
      }
      
      const estimatedExerciseTime = (exerciseSets * exerciseSetDuration) + ((exerciseSets - 1) * 15) + 45;
      
      if (estimatedExerciseTime > remainingTime) {
        const minSets = (isBalance || isPlank) ? 2 : 1;
        exerciseSets = Math.max(minSets, Math.floor(remainingTime / (exerciseSetDuration + 15)));
      }
      
      for (let set = 1; set <= exerciseSets; set++) {
        const dur = isBalance ? 90 : exerciseData.duration[fitnessLevel];
        plan.push({ exercise: exercise, duration: dur, type: 'exercise', set, totalSets: exerciseSets });
        usedTime += dur;
        
        if (set < exerciseSets) {
          plan.push({ type: 'transition', duration: 15 });
          usedTime += 15;
        }
      }
      
      const exerciseIndex = otherExercises.indexOf(exercise);
      if (exerciseIndex < otherExercises.length - 1) {
        plan.push({ type: 'rest', duration: 45 });
        usedTime += 45;
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
    speak('Get ready! Starting in 5, 4, 3, 2, 1');
    setTimeout(() => {
      setIsRunning(true);
      setCountdown(0);
      const firstExercise = workoutPlan[0];
      setTimeLeft(firstExercise.duration);
      
      if (firstExercise.isSkipping) {
        const skipsEst = Math.round((firstExercise.duration / 45) * 105);
        setEstimatedSkips(skipsEst);
      }
    }, 5100);
  };

  // CONFIG SCREEN
  if (stage === 'config') {
    return (
      <div style={{ padding: '50px 40px', ...fontStyle, maxWidth: '900px', margin: '0 auto', minHeight: '100vh', background: colors.light }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');`}</style>

        <h1 style={{ color: colors.primary, marginBottom: '5px', fontSize: '3.8em', fontWeight: '700' }}>PowerUp</h1>
        <p style={{ color: colors.textSecondary, fontSize: '1.3em', fontWeight: '500', marginBottom: '40px' }}>Your Fitness Champion!</p>

        <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '16px', border: `3px solid ${colors.primary}` }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[15, 20, 25, 30, 35, 40].map(mins => (
              <button key={mins} onClick={() => setDuration(mins)} style={{ padding: '10px 16px', background: duration === mins ? colors.primary : 'white', color: duration === mins ? 'white' : colors.text, border: `2px solid ${duration === mins ? colors.primary : colors.border}`, borderRadius: '10px', cursor: 'pointer', fontWeight: '700', ...fontStyle, fontSize: '1.05em', transition: 'all 0.2s ease' }}>
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <h2 style={{ color: colors.text, marginBottom: '20px', fontSize: '1.6em', fontWeight: '600' }}>⭐ Saved Workouts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '50px' }}>
          {Object.entries(presets).map(([key, preset]) => {
            const dailyProgress = (skipStats.daily / preset.defaultSkipGoal) * 100;
            return (
              <div key={key} onClick={() => { setSelectedPreset(key); setSelectedGoal(null); setSelectedExercises([]); setShowSkipGoalModal(true); setSkipInput(preset.defaultSkipGoal.toString()); }} style={{ padding: '25px', background: selectedPreset === key ? colors.primary : 'white', color: selectedPreset === key ? 'white' : colors.text, border: `3px solid ${selectedPreset === key ? colors.primary : colors.border}`, borderRadius: '16px', cursor: 'pointer', ...fontStyle, transition: 'all 0.3s ease' }}>
                <div style={{ fontSize: '2.5em', marginBottom: '12px' }}>{preset.emoji}</div>
                <div style={{ fontWeight: '700', fontSize: '1.25em', marginBottom: '8px' }}>{preset.name}</div>
                <div style={{ fontSize: '1em', marginBottom: '8px', fontWeight: '500' }}>{preset.blurb}</div>
                <div style={{ fontSize: '0.9em', opacity: 0.85, marginBottom: '12px', fontStyle: 'italic' }}>{preset.exercises}</div>
                <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '10px', fontWeight: '500' }}>🎯 Today: {skipStats.daily}/{preset.defaultSkipGoal}</div>
                <div style={{ background: colors.border, height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: selectedPreset === key ? 'white' : colors.primary, height: '100%', width: `${Math.min(dailyProgress, 100)}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {showSkipGoalModal && (
          <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto', ...fontStyle }}>
              <h3 style={{ color: colors.primary, marginBottom: '20px', fontSize: '1.6em', fontWeight: '700' }}>⛹️ Skip Goal</h3>
              <p style={{ color: colors.text, marginBottom: '15px', fontSize: '1.05em', fontWeight: '500' }}>How many skips today?</p>
              <input type="number" value={skipInput} onChange={(e) => setSkipInput(e.target.value)} style={{ width: '100%', padding: '14px', border: `2px solid ${colors.border}`, borderRadius: '10px', fontSize: '1.2em', marginBottom: '20px', boxSizing: 'border-box', color: colors.text, ...fontStyle, fontWeight: '600' }} />
              <style>{`input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type="number"] { -moz-appearance: textfield; }`}</style>
              
              <div style={{ background: colors.light, padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ color: colors.text, fontSize: '0.95em', marginBottom: '10px', fontWeight: '600' }}>🔥 Skipping Calories:</div>
                <div style={{ color: colors.primary, fontSize: '1.8em', fontWeight: '700', marginBottom: '8px' }}>~{calculateSkipsCalories(parseInt(skipInput || 250))}</div>
                <div style={{ color: colors.text, fontSize: '0.95em' }}>≈ {getCalorieContext(calculateSkipsCalories(parseInt(skipInput || 250)))}</div>
              </div>

              <div style={{ background: colors.light, padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ color: colors.text, fontSize: '0.95em', marginBottom: '10px', fontWeight: '600' }}>💪 Total Workout:</div>
                <div style={{ color: colors.primary, fontSize: '1.6em', fontWeight: '700', marginBottom: '8px' }}>~260 cal</div>
                <div style={{ color: colors.text, fontSize: '0.95em' }}>≈ {getCalorieContext(260)}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowSkipGoalModal(false); setSelectedPreset(null); }} style={{ flex: 1, padding: '12px', background: colors.border, color: colors.text, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', ...fontStyle, fontSize: '1.05em' }}>Cancel</button>
                <button onClick={() => { setSkipGoal(parseInt(skipInput || 250)); setShowSkipGoalModal(false); generatePlan(); }} style={{ flex: 1, padding: '12px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', ...fontStyle, fontSize: '1.05em' }}>Let's Go!</button>
              </div>
            </div>
          </div>
        )}

        <h2 style={{ color: colors.text, marginBottom: '20px', fontSize: '1.6em', fontWeight: '600' }}>🎯 Quick Goals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '50px' }}>
          {Object.keys(goals).map((goal) => (
            <button key={goal} onClick={() => { setSelectedGoal(goal); setSelectedExercises([]); setSelectedPreset(null); }} style={{ padding: '18px', background: selectedGoal === goal ? colors.primary : 'white', color: selectedGoal === goal ? 'white' : colors.text, border: `2px solid ${selectedGoal === goal ? colors.primary : colors.border}`, borderRadius: '12px', cursor: 'pointer', ...fontStyle, fontSize: '1em', fontWeight: selectedGoal === goal ? 'bold' : '600', transition: 'all 0.3s ease', textAlign: 'center', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '2em', marginBottom: '8px' }}>
                {goal === 'general' && '⭐'}
                {goal === 'core' && '💪'}
                {goal === 'cardio' && '🏃'}
                {goal === 'strength' && '💥'}
                {goal === 'balance' && '⚖️'}
                {goal === 'hiit' && '⚡'}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.15em' }}>
                {goal.charAt(0).toUpperCase() + goal.slice(1)}
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button onClick={() => generatePlan()} style={{ width: '100%', padding: '16px', background: colors.primary, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', ...fontStyle, fontSize: '1.2em', transition: 'all 0.3s ease' }} >
            📋 Prepare Workout
          </button>
        </div>
      </div>
    );
  }

  // Placeholder for other screens - will add if needed
  return <div style={{...fontStyle}}>Loading...</div>;
}
